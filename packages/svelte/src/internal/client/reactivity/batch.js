/** @import { Fork } from 'svelte' */
/** @import { BatchRecord, Derived, Effect, Reaction, Source, Value } from '#client' */
import {
	BLOCK_EFFECT,
	BRANCH_EFFECT,
	CLEAN,
	DESTROYED,
	DIRTY,
	EFFECT,
	ASYNC,
	INERT,
	RENDER_EFFECT,
	ROOT_EFFECT,
	MAYBE_DIRTY,
	DERIVED,
	EAGER_EFFECT,
	ERROR_VALUE,
	MANAGED_EFFECT,
	REACTION_RAN,
	DESTROYING,
	EFFECT_OFFSCREEN
} from '#client/constants';
import { async_mode_flag } from '../../flags/index.js';
import { deferred, define_property } from '../../shared/utils.js';
import {
	active_reaction,
	get,
	increment_write_version,
	is_dirty,
	promote_record,
	update_effect
} from '../runtime.js';
import * as e from '../errors.js';
import { flush_tasks, queue_micro_task } from '../dom/task.js';
import { DEV } from 'esm-env';
import { invoke_error_boundary } from '../error-handling.js';
import { flush_eager_effects, old_values, set_eager_effects, source, update } from './sources.js';
import { eager_effect, teardown, unlink_effect } from './effects.js';
import { defer_effect } from './utils.js';
import { UNINITIALIZED } from '../../../constants.js';
import { set_signal_status, update_derived_status } from './status.js';
import { invariant } from '../../shared/dev.js';
import { OBSOLETE } from './deriveds.js';

/** @type {Batch | null} */
export let first_batch = null;

/** @type {Batch | null} */
let last_batch = null;

/** @type {Batch | null} */
export let current_batch = null;

/**
 * This is needed to avoid overwriting inputs
 * @type {Batch | null}
 */
export let previous_batch = null;

/**
 * When time travelling (i.e. working in one batch, while other batches
 * still have ongoing work), we ignore the real values of affected
 * signals in favour of their values within the batch — along with their
 * versions. It also caches deriveds evaluated in this view of the world
 * (see `view_entry`), in which case `l` tells whether the value is the
 * latest (real-world) value, and `e` whether it is an error.
 * `null` means that the real world (i.e. the latest values) applies
 * @type {Map<Value, { v: any, wv: number, l?: boolean, e?: boolean }> | null}
 */
export let batch_values = null;

/**
 * The batch whose view of the world is active (see `apply`). Block and async
 * effects that run while it is processed, and deriveds evaluated with values
 * that are not the latest, are recorded in this batch
 * @type {Batch | null}
 */
export let view_batch = null;

/** @type {Effect | null} */
let last_scheduled_effect = null;

/**
 * Batches whose view of the world changed because another batch committed, and that
 * therefore need to be processed again once the current flush is done (see `#commit`)
 * @type {Set<Batch>}
 */
var rebases = new Set();

export let is_flushing_sync = false;
let is_processing = false;

/**
 * During traversal, this is an array. Newly created effects are (if not immediately
 * executed) pushed to this array, rather than going through the scheduling
 * rigamarole that would cause another turn of the flush loop.
 * @type {Effect[] | null}
 */
export let collected_effects = null;

/**
 * An array of effects that are marked during traversal as a result of a `set`
 * (not `internal_set`) call. These will be added to the next batch and
 * trigger another `batch.process()`
 * @type {Effect[] | null}
 * @deprecated when we get rid of legacy mode and stores, we can get rid of this
 */
export let legacy_updates = null;

var flush_count = 0;

/** @type {Set<Value>} */
var source_stacks = new Set();

let uid = 1;

export class Batch {
	id = uid++;

	/** True as soon as `#process` was called */
	started = false;

	linked = true;

	/** @type {Batch | null} */
	prev = null;

	/** @type {Batch | null} */
	next = null;

	/** @type {Map<Effect, ReturnType<typeof deferred<any>>>} */
	async_deriveds = new Map();

	/**
	 * The current values (and their versions) of any sources that are updated in this batch,
	 * including deriveds that were overridden via assignment.
	 * The keys of this map are identical to `this.previous`
	 * @type {Map<Value, { v: any, wv: number }>}
	 */
	current = new Map();

	/**
	 * The values (and their versions) of any sources that are updated in this batch _before_ those updates took place.
	 * The keys of this map are identical to `this.current`
	 * @type {Map<Value, { v: any, wv: number }>}
	 */
	previous = new Map();

	/**
	 * Results of reactions that belong to this batch rather than to the real world:
	 * deriveds evaluated in this batch's view of the world with values that are not the
	 * latest ones, and block/async effects that ran while this batch was processed.
	 * Effect records become global state when the batch commits (see `promote_record`)
	 * @type {Map<Reaction, BatchRecord> | null}
	 */
	records = null;

	/**
	 * True while the batch commits, i.e. while it updates the DOM and runs effects.
	 * Effects that run then do so for the real world
	 */
	committing = false;

	/**
	 * Earlier batches whose changes are part of this batch's view of the world, because
	 * they intersect with it (this batch will be merged into them, see `#merge`)
	 * @type {Batch[]}
	 */
	folded = [];

	/**
	 * When the batch is committed (and the DOM is updated), we need to remove old branches
	 * and append new ones by calling the functions added inside (if/each/key/etc) blocks
	 * @type {Set<(batch: Batch) => void>}
	 */
	#commit_callbacks = new Set();

	/**
	 * If a fork is discarded, we need to destroy any effects that are no longer needed
	 * @type {Set<(batch: Batch) => void>}
	 */
	#discard_callbacks = new Set();

	/**
	 * The number of async effects that are currently in flight
	 */
	#pending = 0;

	/**
	 * Async effects that are currently in flight, _not_ inside a pending boundary
	 * @type {Map<Effect, number>}
	 */
	#blocking_pending = new Map();

	/**
	 * A deferred that resolves when the batch is committed, used with `settled()`
	 * TODO replace with Promise.withResolvers once supported widely enough
	 * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
	 */
	#deferred = null;

	/**
	 * Effects that were scheduled while this batch wasn't being processed (see `schedule`)
	 * @type {Set<Effect> | null}
	 */
	#unprocessed = null;

	/**
	 * Effects that were scheduled in this batch but not yet 'resolved' into the
	 * root effects that need to be flushed. Resolving — the upwards traversal that
	 * marks the path to each effect on the shared effect tree (see #resolve) — is
	 * deferred until the batch is processed, so that the markers are created and
	 * consumed within a single traversal. Scheduling into other batches (which can
	 * happen concurrently, e.g. while a batch is committed) can therefore never
	 * observe (and be confused by) this batch's markers.
	 * May contain duplicates — deduplication happens during resolving
	 * @type {Effect[]}
	 */
	#scheduled = [];

	/**
	 * Deferred effects (which run after async work has completed) and their status (DIRTY or MAYBE_DIRTY)
	 * @type {Map<Effect, number>}
	 */
	#dirty_reactions = new Map();

	/**
	 * A map of branches that still exist, but will be destroyed when this batch
	 * is committed — we skip over these during `process`.
	 * The value contains child effects that were dirty/maybe_dirty before being reset,
	 * so they can be rescheduled if the branch survives.
	 * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
	 */
	#skipped_branches = new Map();

	/**
	 * Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
	 * @type {Set<Effect>}
	 */
	#unskipped_branches = new Set();

	is_fork = false;

	#decrement_queued = false;

	constructor() {
		if (last_batch === null) {
			first_batch = last_batch = this;
		} else {
			last_batch.next = this;
			this.prev = last_batch;
		}

		last_batch = this;
	}

	#is_deferred() {
		if (this.is_fork) return true;

		for (const effect of this.#blocking_pending.keys()) {
			// pending work inside a skipped branch doesn't block, the branch is going to be destroyed
			if (!this.#is_skipped(effect)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Whether `effect` is a branch that this batch skips, or that only exists offscreen for other batches
	 * @param {Effect} effect
	 */
	#skips(effect) {
		return (
			this.#skipped_branches.has(effect) ||
			((effect.f & EFFECT_OFFSCREEN) !== 0 && !this.#unskipped_branches.has(effect))
		);
	}

	/**
	 * Whether `effect` is inside a branch that this batch skips
	 * @param {Effect} effect
	 */
	#is_skipped(effect) {
		for (var e = /** @type {Effect | null} */ (effect); e !== null; e = e.parent) {
			if (this.#skips(e)) return true;
		}

		return false;
	}

	/**
	 * Add an effect to the #skipped_branches map and reset its children
	 * @param {Effect} effect
	 */
	skip_effect(effect) {
		if (!this.#skipped_branches.has(effect)) {
			this.#skipped_branches.set(effect, { d: [], m: [] });
		}
		this.#unskipped_branches.delete(effect);
	}

	/**
	 * Remove an effect from the #skipped_branches map and reschedule
	 * any tracked dirty/maybe_dirty child effects
	 * @param {Effect} effect
	 * @param {(e: Effect, status: number) => void} callback
	 */
	unskip_effect(effect, callback = (e, status) => this.schedule(e, status)) {
		var tracked = this.#skipped_branches.get(effect);
		if (tracked) {
			this.#skipped_branches.delete(effect);

			for (var e of tracked.d) {
				callback(e, DIRTY);
			}

			for (e of tracked.m) {
				callback(e, MAYBE_DIRTY);
			}
		}

		if ((effect.f & EFFECT_OFFSCREEN) !== 0 && !this.#unskipped_branches.has(effect)) {
			// This batch adopts a branch that so far only existed offscreen (possibly for another
			// batch, whose view of the world its effects ran in) — re-validate them in this batch's view
			this.#revalidate_branch(effect, callback);
		}

		this.#unskipped_branches.add(effect);
	}

	/**
	 * @param {Effect} effect
	 * @param {(e: Effect, status: number) => void} callback
	 */
	#revalidate_branch(effect, callback) {
		for (var e = effect.first; e !== null; e = e.next) {
			var flags = e.f;

			// (branches nested inside that exist offscreen for other batches only are not adopted)
			if ((flags & (DESTROYED | INERT)) === 0 && !this.#skips(e)) {
				if ((flags & (BRANCH_EFFECT | ROOT_EFFECT | EAGER_EFFECT)) === 0 && e.fn !== null) {
					callback(e, MAYBE_DIRTY);
				}

				this.#revalidate_branch(e, callback);
			}
		}
	}

	/**
	 * Convert the effects that were scheduled in this batch into the root effects
	 * that need to be traversed, marking the path to each effect (by clearing the
	 * `CLEAN` flag on ancestor branches) so that the traversal can find them.
	 * This happens right before traversal rather than at scheduling time, so that
	 * the markers left on the (shared) effect tree are created and consumed within
	 * a single traversal — scheduling into other batches can never observe them
	 * @returns {Effect[]}
	 */
	#resolve() {
		/** @type {Effect[]} */
		var roots = [];

		for (const effect of this.#scheduled) {
			// skip effects that are destroyed, or that already ran (e.g. because
			// they were reached by the traversal that preceded a drain iteration,
			// or because they were scheduled twice)
			if ((effect.f & DESTROYED) !== 0 || (effect.f & (DIRTY | MAYBE_DIRTY)) === 0) continue;

			var e = effect;
			var covered = false;

			while (e.parent !== null) {
				e = e.parent;
				var flags = e.f;

				if ((flags & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
					if ((flags & CLEAN) === 0) {
						// the path to the root was already marked, meaning the
						// root was already collected — nothing left to do
						covered = true;
						break;
					}

					e.f ^= CLEAN;
				}
			}

			if (!covered) {
				roots.push(e);
			}
		}

		this.#scheduled = [];

		return roots;
	}

	#process() {
		if (async_mode_flag && this.started) {
			// Since this batch last ran, reactions may have come to depend on its writes without it
			// knowing (e.g. effects created by other batches), or have run in the view of other batches.
			// Re-validate them in this batch's view — this only re-runs those that are out of date
			this.#revalidate(this.current.keys());
		}

		this.started = true;

		if (this.#unprocessed !== null) {
			for (const e of this.#unprocessed) this.#add(e, MAYBE_DIRTY);
			this.#unprocessed = null;
		}

		if (DEV) {
			// track all the values that were updated during this flush,
			// so that they can be reset afterwards
			for (const value of this.current.keys()) {
				source_stacks.add(value);
			}
		}

		// We always reschedule previously-deferred effects, not just when
		// #is_deferred() is true, because traversing the tree could make
		// an if block that contains the last blocking pending effect falsy,
		// causing the block to no longer be deferred.
		for (const [e, status] of this.#dirty_reactions) {
			this.#add(e, status);
		}

		this.apply();

		/** @type {Effect[]} */
		var effects = (collected_effects = []);

		/** @type {Effect[]} */
		var render_effects = [];

		/**
		 * @type {Effect[]}
		 * @deprecated when we get rid of legacy mode and stores, we can get rid of this
		 */
		var updates = (legacy_updates = []);

		// Effects can be scheduled during traversal (e.g. because a parent each/await/etc
		// block updated an internal source, or because an effect invalidated itself)
		// hence we loop until there are no more scheduled effects.
		while (this.#scheduled.length > 0) {
			if (flush_count++ > 1000) {
				this.#unlink();
				infinite_loop_guard(); // TODO try to reset_all() here?
			}

			for (const root of this.#resolve()) {
				try {
					this.#traverse(root, effects, render_effects);
				} catch (e) {
					reset_all(root);
					// If there's no async work left, this branch is now dead and needs
					// to be discarded to not become a zombie that is never cleaned up.
					// See https://github.com/sveltejs/svelte/issues/18221#issuecomment-4497918414
					// for a (non-minimal) reproduction that demonstrates a case where this is necessary
					// to not get follow-up false-positives via "batch has scheduled roots" invariant errors.
					if (!this.#is_deferred()) this.discard();
					throw e;
				}
			}
		}

		// any writes should take effect in a subsequent batch
		current_batch = null;

		if (updates.length > 0) {
			var batch = Batch.ensure();
			for (const e of updates) {
				// these were marked during traversal already (see `mark_reactions`), unless they ran since
				if ((e.f & CLEAN) === 0) batch.schedule(e, (e.f & DIRTY) !== 0 ? DIRTY : MAYBE_DIRTY);
			}
		}

		collected_effects = null;
		legacy_updates = null;

		// if the batch has outstanding pending work, stash effects and bail
		if (this.#is_deferred()) {
			this.#defer_effects(render_effects);
			this.#defer_effects(effects);

			for (const [e, t] of this.#skipped_branches) {
				reset_branch(e, t);
			}

			if (updates.length > 0) {
				/** @type {Batch} */ (/** @type {unknown} */ (current_batch)).#process();
			}

			return;
		}

		const earlier_batch = this.#find_earlier_batch();

		if (earlier_batch) {
			// If this batch collected deferred effects during traversal, they still need
			// to run after being merged into the earlier batch.
			this.#defer_effects(render_effects);
			this.#defer_effects(effects);
			earlier_batch.#merge(this);
			return;
		}

		// clear effects. Those that are still needed will be rescheduled through unskipping the skipped branches.
		this.#dirty_reactions.clear();

		// The results of this batch are about to become the real-world state
		this.committing = true;

		if (this.records !== null) {
			for (const [reaction, record] of this.records) {
				if ((reaction.f & (DERIVED | DESTROYED)) === 0) promote_record(reaction, record);
			}

			this.records = null;
		}

		// append/remove branches
		for (const fn of this.#commit_callbacks) fn(this);
		this.#commit_callbacks.clear();

		previous_batch = this;
		flush_queued_effects(render_effects);
		flush_queued_effects(effects);
		previous_batch = null;

		this.committing = false;

		this.#deferred?.resolve();

		var next_batch = /** @type {Batch | null} */ (/** @type {unknown} */ (current_batch));

		if (this.#pending === 0 && (this.#scheduled.length === 0 || next_batch !== null)) {
			this.#unlink();

			// Order matters here - we need to commit and THEN continue flushing new batches, not the other way around,
			// else we could start flushing a new batch and then, if it has pending work, rebase it right afterwards, which is wrong.
			// In sync mode flushSync can cause #commit to wrongfully think that there needs to be a rebase, so we only do it in async mode
			// TODO fix the underlying cause, otherwise this will likely regress when non-async mode is removed
			if (async_mode_flag) {
				this.#commit();
				// Rebases can activate other batches or null it out, therefore restore the new one here
				current_batch = next_batch;
			}
		}

		// Edge case: During traversal new branches might create effects that run immediately and set state,
		// causing an effect to be scheduled again. We need to traverse the current batch
		// once more in that case - most of the time this will just clean up dirty branches.
		if (this.#scheduled.length > 0) {
			if (next_batch !== null) {
				for (const e of this.#scheduled) {
					next_batch.#scheduled.push(e);
				}

				this.#scheduled = [];
			} else {
				next_batch = this;
			}
		}

		if (next_batch !== null) {
			old_values.clear();
			next_batch.#process();
		}
	}

	/**
	 * Schedule the reactions that (transitively) depend on `values` for re-validation in this batch.
	 * They are marked MAYBE_DIRTY, which means that they are only re-run if the exact versions
	 * of their dependencies differ from the ones they last saw (in this batch's view of the world)
	 * @param {Iterable<Value>} values
	 * @param {Set<Reaction>} seen
	 */
	#revalidate(values, seen = new Set()) {
		for (const value of values) {
			for (const reaction of value.reactions ?? []) {
				var flags = reaction.f;

				if (seen.has(reaction)) continue;
				seen.add(reaction);

				if ((flags & DERIVED) !== 0) {
					if ((flags & CLEAN) !== 0) set_signal_status(reaction, MAYBE_DIRTY);
					this.#revalidate([/** @type {Derived} */ (reaction)], seen);
				} else if (
					(flags & (EAGER_EFFECT | INERT | DESTROYED)) === 0 &&
					// branches that this batch skips don't exist in its view of the world
					!this.#is_skipped(/** @type {Effect} */ (reaction))
				) {
					this.schedule(/** @type {Effect} */ (reaction), MAYBE_DIRTY);
				}
			}
		}
	}

	/**
	 * Traverse the effect tree, executing effects or stashing
	 * them for later execution as appropriate
	 * @param {Effect} root
	 * @param {Effect[]} effects
	 * @param {Effect[]} render_effects
	 */
	#traverse(root, effects, render_effects) {
		root.f ^= CLEAN;

		var effect = root.first;

		while (effect !== null) {
			var flags = effect.f;
			var is_branch = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
			var is_skippable_branch = is_branch && (flags & CLEAN) !== 0;

			var skip =
				is_skippable_branch ||
				(flags & INERT) !== 0 ||
				this.#skipped_branches.has(effect) ||
				// branches that exist offscreen only for other batches
				((flags & EFFECT_OFFSCREEN) !== 0 && !this.#unskipped_branches.has(effect));

			if (!skip && effect.fn !== null) {
				if (is_branch) {
					effect.f ^= CLEAN;
				} else if ((flags & EFFECT) !== 0) {
					effects.push(effect);
				} else if (async_mode_flag && (flags & (RENDER_EFFECT | MANAGED_EFFECT)) !== 0) {
					render_effects.push(effect);
				} else if (is_dirty(effect)) {
					if ((flags & BLOCK_EFFECT) !== 0) this.add_dirty_reaction(effect, MAYBE_DIRTY);
					update_effect(effect);
				}

				var child = effect.first;

				if (child !== null) {
					effect = child;
					continue;
				}
			}

			while (effect !== null) {
				var next = effect.next;

				if (next !== null) {
					effect = next;
					break;
				}

				effect = effect.parent;
			}
		}
	}

	#find_earlier_batch() {
		var batch = this.prev;

		while (batch !== null) {
			if (!batch.is_fork) {
				// if the batches are connected, break
				for (const value of this.current.keys()) {
					if (batch.current.has(value)) {
						return batch;
					}
				}
			}

			batch = batch.prev;
		}

		return null;
	}

	/**
	 * Take over the writes of a later batch that depends on this one, because it finished first.
	 * Values it produced (async results, deriveds) remain valid; block effects select their
	 * branches again for this batch, if needed (their selections are keyed by batch)
	 * @param {Batch} batch
	 */
	#merge(batch) {
		for (const [source, value] of batch.current) {
			if (!this.previous.has(source) && batch.previous.has(source)) {
				this.previous.set(
					source,
					/** @type {{ v: any, wv: number }} */ (batch.previous.get(source))
				);
			}

			this.current.set(source, value);
		}

		for (const [effect, deferred] of batch.async_deriveds) {
			const d = this.async_deriveds.get(effect);
			if (d) deferred.promise.then(d.resolve).catch(d.reject);
		}

		for (const [reaction, record] of batch.records ?? []) {
			if ((reaction.f & BLOCK_EFFECT) === 0) {
				(this.records ??= new Map()).set(reaction, record);
			}
		}

		// Clear them or else those that are still pending might get rejected on discard (after merged-into batch is done).
		// This can happen when batch Y merged into X and Y has a pending boundary and therefore still-pending async deriveds inside.
		batch.async_deriveds.clear();

		this.transfer_reactions(batch.#dirty_reactions);

		this.oncommit(() => batch.discard());
		batch.#unlink();

		// processing re-validates everything that depends on the (now merged) writes of this batch
		current_batch = this;
		this.#process();
	}

	/**
	 * @param {Effect[]} effects
	 */
	#defer_effects(effects) {
		for (var i = 0; i < effects.length; i += 1) {
			defer_effect(effects[i], this.#dirty_reactions);
		}
	}

	/**
	 * Associate a change to a given source with the current
	 * batch, noting its previous and current values (and versions).
	 * The source itself is only updated if this is its latest value, i.e. unless this
	 * is a fork (whose writes only exist in its own view of the world) or a later batch
	 * already wrote to it (e.g. because an async expression resolved in an earlier batch).
	 * @param {Value} source
	 * @param {any} value
	 * @param {boolean} same whether the value equals the real one (it can, if this batch sees another one, see
	 * `internal_set`) — in which case the source isn't updated, and the value gets the same version
	 * @returns {boolean} whether the value is the latest one
	 */
	capture(source, value, same) {
		var later = this.next;

		while (later !== null && (later.is_fork || !later.current.has(source))) {
			later = later.next;
		}

		if (!this.previous.has(source)) {
			// the value before this batch's change is the one before the later batch's change, if any
			var previous = later === null ? source : later.previous.get(source);

			if (previous !== undefined && previous.v !== UNINITIALIZED) {
				this.previous.set(source, { v: previous.v, wv: previous.wv });
			}
		}

		// errors are never batch-local, or they wouldn't be thrown in `runtime.js#get`
		var error = (source.f & ERROR_VALUE) !== 0;
		same &&= !error;
		var latest = !this.is_fork && !same && (later === null || error);
		var entry = {
			v: value,
			wv: same ? source.wv : increment_write_version()
		};

		if (!error) {
			this.current.set(source, entry);
			batch_values?.set(source, entry);
		}

		if (latest) {
			source.v = value;
			source.wv = entry.wv;
		}

		return latest;
	}

	activate() {
		current_batch = this;
	}

	deactivate() {
		current_batch = null;
		batch_values = null;
		view_batch = null;
	}

	flush() {
		try {
			if (DEV) {
				source_stacks.clear();
			}

			is_processing = true;
			current_batch = this;

			this.#process();

			// (the size check avoids allocating an iterator in the common case)
			if (rebases.size > 0) {
				for (const batch of rebases) {
					rebases.delete(batch);

					// the batch is processed again anyway if a flush is queued
					if (batch.linked && !batch.#decrement_queued) {
						old_values.clear();
						current_batch = batch;
						batch.#process();
					}
				}
			}
		} finally {
			flush_count = 0;
			last_scheduled_effect = null;
			collected_effects = null;
			legacy_updates = null;
			is_processing = false;

			current_batch = null;
			batch_values = null;
			view_batch = null;

			old_values.clear();

			if (DEV) {
				for (const source of source_stacks) {
					source.updated = null;
				}
			}
		}
	}

	discard() {
		for (const fn of this.#discard_callbacks) fn(this);
		this.#discard_callbacks.clear();

		for (const deferred of this.async_deriveds.values()) {
			deferred.reject(OBSOLETE);
		}

		this.#unlink();
		this.#deferred?.resolve();
	}

	#commit() {
		// If there are other pending batches, they now need to be 'rebased' —
		// in other words, their view of the world now includes the newly committed
		// state (unless the batch in question has a more recent value for a given source),
		// so everything that depends on it needs to be re-validated in their view
		for (let batch = first_batch; batch !== null; batch = batch.next) {
			var is_earlier = batch.id < this.id;

			/** @type {Source[]} */
			var sources = [];

			for (const [source, value] of this.current) {
				var own = batch.current.get(source);

				if (own !== undefined) {
					if (is_earlier && value.v !== own.v) {
						// bring the value up to date
						batch.current.set(source, value);
					} else {
						// same value or later batch has more recent value,
						// no need to re-run these effects
						continue;
					}
				}

				sources.push(source);
			}

			if (is_earlier) {
				// TODO do we need to restart these in some cases, instead of
				// immediately resolving them? Likely not because of how this.apply() works.
				for (const [effect, deferred] of this.async_deriveds) {
					const d = batch.async_deriveds.get(effect);
					if (d) deferred.promise.then(d.resolve).catch(d.reject);
				}
			}

			// If not started yet or no sources to update (which is e.g. possible for the very first batch) then bail
			if (!batch.started || batch.current.size === 0) continue;

			var obsolete = true;

			for (const source of batch.current.keys()) {
				if (!this.current.has(source)) {
					obsolete = false;
					break;
				}
			}

			if (obsolete) {
				if (is_earlier) {
					// this batch is now obsolete and can be discarded
					batch.discard();
				}
			} else if (sources.length > 0) {
				// The microtask queue can contain the batch already scheduled to run right
				// after this one is finished, so throwing the invariant would be wrong here.
				if (DEV && !batch.#decrement_queued) {
					invariant(batch.#scheduled.length === 0, 'Batch has scheduled effects');
				}

				// A batch was unskipped in a later batch -> tell prior batches to unskip it, too
				if (is_earlier) {
					for (const unskipped of this.#unskipped_branches) {
						batch.unskip_effect(unskipped, (e, status) => {
							if ((e.f & (BLOCK_EFFECT | ASYNC)) !== 0) {
								batch.schedule(e, status);
							} else {
								batch.add_dirty_reaction(e, status);
							}
						});
					}
				}

				// Everything that depends on the committed values needs to be re-validated in the
				// batch's view. The batch is processed again once the current flush is done (which
				// also re-validates what depends on its own writes, as the committed batch may have
				// created reactions that read them), so that block effects select their branches
				// and async work restarts in the new view right away
				batch.#revalidate(sources);
				rebases.add(batch);
			}
		}
	}

	/**
	 * @param {boolean} blocking
	 * @param {Effect} effect
	 */
	increment(blocking, effect) {
		this.#pending += 1;

		if (blocking) {
			let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
			this.#blocking_pending.set(effect, blocking_pending_count + 1);
		}
	}

	/**
	 * @param {boolean} blocking
	 * @param {Effect} effect
	 */
	decrement(blocking, effect) {
		this.#pending -= 1;

		if (blocking) {
			let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;

			if (blocking_pending_count === 1) {
				this.#blocking_pending.delete(effect);
			} else {
				this.#blocking_pending.set(effect, blocking_pending_count - 1);
			}
		}

		if (this.#decrement_queued) return;
		this.#decrement_queued = true;

		queue_micro_task(() => {
			this.#decrement_queued = false;

			if (this.linked) {
				this.flush();
			}
		});
	}

	/**
	 * @param {Map<Effect, number>} dirty_reactions
	 */
	transfer_reactions(dirty_reactions) {
		for (const [effect, status] of dirty_reactions) {
			this.add_dirty_reaction(effect, status);
		}

		dirty_reactions.clear();
	}

	/**
	 * @param {Effect} effect
	 * @param {number} status
	 */
	add_dirty_reaction(effect, status) {
		if (status === DIRTY || this.#dirty_reactions.get(effect) !== DIRTY) {
			this.#dirty_reactions.set(effect, status);
		}
	}

	/** @param {(batch: Batch) => void} fn */
	oncommit(fn) {
		this.#commit_callbacks.add(fn);
	}

	/** @param {(batch: Batch) => void} fn */
	ondiscard(fn) {
		this.#discard_callbacks.add(fn);
	}

	settled() {
		return (this.#deferred ??= deferred()).promise;
	}

	static ensure() {
		if (current_batch === null) {
			const batch = (current_batch = new Batch());

			if (!is_processing && !is_flushing_sync) {
				queue_micro_task(() => {
					if (!batch.started) {
						batch.flush();
					}
				});
			}
		}

		return current_batch;
	}

	/**
	 * Make this batch's view of the world the active one
	 */
	apply() {
		if (!async_mode_flag) {
			batch_values = null;
			return;
		}

		view_batch = this;
		this.folded = [];

		if (!this.is_fork && this.prev === null && this.next === null) {
			// this batch's view is the real world
			batch_values = null;
			return;
		}

		// if there are multiple batches, we are 'time travelling' —
		// we need to override values with the ones in this batch...
		batch_values = new Map(this.current);

		// ...and undo changes belonging to other batches unless they intersect
		for (let batch = first_batch; batch !== null; batch = batch.next) {
			if (batch === this || batch.is_fork) continue;

			// If two batches intersect, the latter batch will be merged into the earlier batch,
			// and we should treat them as a single set of changes
			var intersects = false;

			if (batch.id < this.id) {
				for (const source of batch.current.keys()) {
					if (this.current.has(source)) {
						intersects = true;
						break;
					}
				}
			}

			// Since the latter batch merges into the earlier (if it resolves before the earlier one),
			// we treat the earlier values as "already applied". This way we don't need to rerun async
			// effects of the earlier batch in case they are merged.
			// As a result you can think of batch_values as having the latest values of all intersecting
			// batches up until this batch.
			if (intersects) {
				this.folded.push(batch);
			} else {
				for (const [source, previous] of batch.previous) {
					// (where the views agree on the value, the real one — and its version — applies)
					if (!batch_values.has(source) && !source.equals(previous.v)) {
						batch_values.set(source, previous);
					}
				}
			}
		}
	}

	/**
	 * The record of `reaction` in this batch's view of the world, i.e. that of this batch
	 * or of the (earlier) batches whose changes it includes, if any
	 * @param {Reaction} reaction
	 * @returns {BatchRecord | undefined}
	 */
	record(reaction) {
		var record = this.records?.get(reaction);

		for (var i = this.folded.length - 1; record === undefined && i >= 0; i--) {
			record = this.folded[i].records?.get(reaction);
		}

		return record;
	}

	/**
	 * Schedule `effect` to be (re-)validated when this batch is processed. Its status only applies right
	 * away if this is the batch that the current flush processes (next), or if a reaction is running (which
	 * may have read what changed). Otherwise, whether an effect is dirty depends on this batch's view of the
	 * world, so other batches (which may be processed first) mustn't see it: it is kept with this batch until
	 * it is processed, and then checked against the exact versions of its dependencies (i.e. MAYBE_DIRTY).
	 * Without other batches, that can happen right away
	 * @param {Effect} effect
	 * @param {number} status DIRTY or MAYBE_DIRTY
	 */
	schedule(effect, status) {
		last_scheduled_effect = effect;

		if ((!is_processing || current_batch !== this) && active_reaction === null) {
			if (this.prev !== null || this.next !== null || this.is_fork) {
				(this.#unprocessed ??= new Set()).add(effect);
				return;
			}

			status = MAYBE_DIRTY;
		}

		this.#add(effect, status);
	}

	/**
	 * @param {Effect} effect
	 * @param {number} status
	 */
	#add(effect, status) {
		// don't set a DIRTY effect to MAYBE_DIRTY
		if ((effect.f & DIRTY) === 0) {
			set_signal_status(effect, status);
		}

		// defer render effects inside a pending boundary
		// TODO the `REACTION_RAN` check is only necessary because of legacy `$:` effects AFAICT — we can remove later
		if (
			effect.b?.is_pending &&
			(effect.f & (EFFECT | RENDER_EFFECT | MANAGED_EFFECT)) !== 0 &&
			(effect.f & REACTION_RAN) === 0
		) {
			effect.b.defer_effect(effect);
			return;
		}

		this.#scheduled.push(effect);
	}

	#unlink() {
		// #merge calls #unlink, discard later on does it again - prevent
		// running it multiple times to not corrupt the linked list
		if (!this.linked) return;

		var prev = this.prev;
		var next = this.next;

		if (prev === null) {
			first_batch = next;
		} else {
			prev.next = next;
		}

		if (next === null) {
			last_batch = prev;
		} else {
			next.prev = prev;
		}

		this.linked = false;
		this.records = null;
	}
}

// TODO Svelte@6 think about removing the callback argument.
/**
 * Synchronously flush any pending updates.
 * Returns void if no callback is provided, otherwise returns the result of calling the callback.
 * @template [T=void]
 * @param {(() => T) | undefined} [fn]
 * @returns {T}
 */
export function flushSync(fn) {
	var was_flushing_sync = is_flushing_sync;
	var prev_previous_batch = previous_batch;
	previous_batch = null;
	is_flushing_sync = true;

	try {
		var result;

		if (fn) {
			flushSync(); // flush anything pending through the while loop below

			result = fn();
		}

		while (true) {
			flush_tasks();

			if (current_batch === null) {
				return /** @type {T} */ (result);
			}

			current_batch.flush();
		}
	} finally {
		is_flushing_sync = was_flushing_sync;
		previous_batch = prev_previous_batch;
	}
}

function infinite_loop_guard() {
	if (DEV) {
		var updates = new Map();

		for (const source of /** @type {Batch} */ (current_batch).current.keys()) {
			for (const [stack, update] of source.updated ?? []) {
				var entry = updates.get(stack);

				if (!entry) {
					entry = { error: update.error, count: 0 };
					updates.set(stack, entry);
				}

				entry.count += update.count;
			}
		}

		for (const update of updates.values()) {
			if (update.error) {
				// eslint-disable-next-line no-console
				console.error(update.error);
			}
		}
	}

	try {
		e.effect_update_depth_exceeded();
	} catch (error) {
		if (DEV) {
			// stack contains no useful information, replace it
			define_property(error, 'stack', { value: '' });
		}

		// Best effort: invoke the boundary nearest the most recent
		// effect and hope that it's relevant to the infinite loop
		invoke_error_boundary(error, last_scheduled_effect);
	}
}

/** @type {Set<Effect> | null} */
export let eager_block_effects = null;

/**
 * @param {Array<Effect>} effects
 * @returns {void}
 */
function flush_queued_effects(effects) {
	var length = effects.length;
	if (length === 0) return;

	var i = 0;

	while (i < length) {
		var effect = effects[i++];

		if ((effect.f & (DESTROYED | INERT)) === 0 && is_dirty(effect)) {
			eager_block_effects = new Set();

			update_effect(effect);

			// Effects with no dependencies or teardown do not get added to the effect tree.
			// Deferred effects (e.g. `$effect(...)`) _are_ added to the tree because we
			// don't know if we need to keep them until they are executed. Doing the check
			// here (rather than in `update_effect`) allows us to skip the work for
			// immediate effects.
			if (
				effect.deps === null &&
				effect.first === null &&
				effect.nodes === null &&
				effect.teardown === null &&
				effect.ac === null
			) {
				// remove this effect from the graph
				unlink_effect(effect);
			}

			// If update_effect() has a flushSync() in it, we may have flushed another flush_queued_effects(),
			// which already handled this logic and did set eager_block_effects to null.
			if (eager_block_effects?.size > 0) {
				old_values.clear();

				for (const e of eager_block_effects) {
					// Skip eager effects that have already been unmounted
					if ((e.f & (DESTROYED | INERT)) !== 0) continue;

					// Run effects in order from ancestor to descendant, else we could run into nullpointers
					/** @type {Effect[]} */
					const ordered_effects = [e];
					let ancestor = e.parent;
					while (ancestor !== null) {
						if (eager_block_effects.has(ancestor)) {
							eager_block_effects.delete(ancestor);
							ordered_effects.push(ancestor);
						}
						ancestor = ancestor.parent;
					}

					for (let j = ordered_effects.length - 1; j >= 0; j--) {
						const e = ordered_effects[j];
						// Skip eager effects that have already been unmounted
						if ((e.f & (DESTROYED | INERT)) !== 0) continue;
						update_effect(e);
					}
				}

				eager_block_effects.clear();
			}
		}
	}

	eager_block_effects = null;
}

/**
 * When committing a fork, we need to trigger eager effects so that
 * any `$state.eager(...)` expressions update immediately. This
 * function allows us to discover them
 * @param {Value} value
 * @param {Set<Effect>} effects
 */
function mark_eager_effects(value, effects) {
	if (value.reactions === null) return;

	for (const reaction of value.reactions) {
		const flags = reaction.f;

		if ((flags & DERIVED) !== 0) {
			mark_eager_effects(/** @type {Derived} */ (reaction), effects);
		} else if ((flags & EAGER_EFFECT) !== 0) {
			set_signal_status(reaction, DIRTY);
			effects.add(/** @type {Effect} */ (reaction));
		}
	}
}

/**
 * @param {Effect} effect
 * @param {number} status DIRTY or MAYBE_DIRTY
 * @returns {void}
 */
export function schedule_effect(effect, status) {
	/** @type {Batch} */ (current_batch).schedule(effect, status);
}

/** @type {Source<number>[]} */
let eager_versions = [];

function eager_flush() {
	flushSync(() => {
		const eager = eager_versions;
		eager_versions = [];
		for (const version of eager) {
			update(version);
		}
	});
}

/** @type {Map<Reaction, Source<number>>} */
var version_map = new Map();

/**
 * Implementation of `$state.eager(fn())`
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
export function eager(fn) {
	var initial = true;
	var value = /** @type {T} */ (undefined);

	if (active_reaction === null) {
		return fn();
	}

	let parent = active_reaction;

	let version = version_map.get(parent) ?? source(0);
	version_map.set(parent, version);

	if (DEV) {
		version.label ??= '$state.eager version';
	}

	teardown(() => {
		if (parent.f & DESTROYING) version_map.delete(parent);
	});

	get(version);

	eager_effect(() => {
		if (initial) {
			// the first time this runs, we create an eager effect
			// that will run eagerly whenever the expression changes
			var previous_batch_values = batch_values;

			try {
				// evaluate in the real world
				batch_values = null;
				value = fn();
			} finally {
				batch_values = previous_batch_values;
			}

			return;
		}

		// the second time this effect runs, it's to schedule a
		// `version` update. since this will recreate the effect,
		// we don't need to evaluate the expression here
		if (eager_versions.length === 0) {
			queue_micro_task(eager_flush);
		}

		eager_versions.push(version);
	});

	initial = false;

	return value;
}

/**
 * Mark all the effects inside a skipped branch CLEAN, so that
 * they can be correctly rescheduled later. Tracks dirty and maybe_dirty
 * effects so they can be rescheduled if the branch survives.
 * @param {Effect} effect
 * @param {{ d: Effect[], m: Effect[] }} tracked
 */
function reset_branch(effect, tracked) {
	// clean branch = nothing dirty inside, no need to traverse further
	if ((effect.f & BRANCH_EFFECT) !== 0 && (effect.f & CLEAN) !== 0) {
		return;
	}

	if ((effect.f & DIRTY) !== 0) {
		tracked.d.push(effect);
	} else if ((effect.f & MAYBE_DIRTY) !== 0) {
		tracked.m.push(effect);
	}

	set_signal_status(effect, CLEAN);

	var e = effect.first;
	while (e !== null) {
		reset_branch(e, tracked);
		e = e.next;
	}
}

/**
 * Mark an entire effect tree clean following an error
 * @param {Effect} effect
 */
function reset_all(effect) {
	set_signal_status(effect, CLEAN);

	var e = effect.first;
	while (e !== null) {
		reset_all(e);
		e = e.next;
	}
}

/**
 * Creates a 'fork', in which state changes are evaluated but not applied to the DOM.
 * This is useful for speculatively loading data (for example) when you suspect that
 * the user is about to take some action.
 *
 * Frameworks like SvelteKit can use this to preload data when the user touches or
 * hovers over a link, making any subsequent navigation feel instantaneous.
 *
 * The `fn` parameter is a synchronous function that modifies some state. The
 * state changes will be reverted after the fork is initialised, then reapplied
 * if and when the fork is eventually committed.
 *
 * When it becomes clear that a fork will _not_ be committed (e.g. because the
 * user navigated elsewhere), it must be discarded to avoid leaking memory.
 *
 * @param {() => void} fn
 * @returns {Fork}
 * @since 5.42
 */
export function fork(fn) {
	if (!async_mode_flag) {
		e.experimental_async_required('fork');
	}

	if (current_batch !== null) {
		e.fork_timing();
	}

	flushSync();

	var batch = Batch.ensure();
	batch.is_fork = true;
	batch_values = new Map();
	view_batch = batch;

	var committed = false;
	var settled = batch.settled();

	fn();
	flushSync();

	return {
		commit: async () => {
			if (committed) {
				await settled;
				return;
			}

			if (!batch.linked) {
				e.fork_discarded();
			}

			committed = true;

			batch.is_fork = false;

			// Apply the changes to the real world. They keep the versions they had in the fork,
			// so that everything the fork computed remains valid (processing the batch
			// re-validates everything that depends on them, see `#process`)
			for (var [source, entry] of batch.current) {
				source.v = entry.v;
				source.wv = entry.wv;

				if ((source.f & DERIVED) !== 0 && /** @type {BatchRecord} */ (entry).dv !== undefined) {
					// an assigned derived, which holds its value until its dependencies change
					promote_record(/** @type {Derived} */ (source), /** @type {BatchRecord} */ (entry));
					update_derived_status(/** @type {Derived} */ (source));
				}
			}

			// trigger any `$state.eager(...)` expressions with the new state.
			// eager effects don't get scheduled like other effects, so we
			// can't just encounter them during traversal, we need to
			// proactively flush them
			// TODO maybe there's a better implementation?
			flushSync(() => {
				/** @type {Set<Effect>} */
				var eager_effects = new Set();

				for (var source of batch.current.keys()) {
					mark_eager_effects(source, eager_effects);
				}

				set_eager_effects(eager_effects);
				flush_eager_effects();
			});

			batch.flush();
			await settled;
		},
		discard: () => {
			if (!committed && batch.linked) {
				batch.discard();
			}
		}
	};
}

/**
 * Forcibly remove all current batches, to prevent cross-talk between tests
 */
export function clear() {
	first_batch = last_batch = null;
}

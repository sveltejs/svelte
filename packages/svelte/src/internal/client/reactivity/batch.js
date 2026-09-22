/** @import { Fork } from 'svelte' */
/** @import { Derived, Effect, Reaction, Signal, Source, Value } from '#client' */
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
	FORK_ONLY_BRANCH
} from '#client/constants';
import { async_mode_flag } from '../../flags/index.js';
import { deferred, define_property, includes } from '../../shared/utils.js';
import {
	active_reaction,
	get,
	increment_write_version,
	is_dirty,
	update_effect,
	write_version
} from '../runtime.js';
import * as e from '../errors.js';
import { flush_tasks, queue_micro_task } from '../dom/task.js';
import { DEV } from 'esm-env';
import { invoke_error_boundary } from '../error-handling.js';
import { flush_eager_effects, old_values, set_eager_effects, source, update } from './sources.js';
import { eager_effect, teardown, unlink_effect } from './effects.js';
import { defer_effect } from './utils.js';
import { UNINITIALIZED } from '../../../constants.js';
import { set_signal_status } from './status.js';
import { log_effect_tree } from '../dev/debug.js';
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
 * signals in favour of their values within the batch
 * @type {Map<Value, any> | null}
 */
export let batch_values = null;

/**
 * When time travelling (i.e. working in one batch, while other batches
 * still have ongoing work), we ignore the real wv of affected
 * signals in favour of their wv within the batch
 * @type {Map<Signal, number> | null}
 */
export let wv_values = null;

/**
 * Sources which were written to before the current batch. Used to discover dependencies between batches.
 * @type {Map<Value, Batch> | null}
 */
export let held_sources = null;

/**
 * Sources where the current batch reads an outdated value of a later batch (or if this is an eager batch, any other batch) not in its own `current` map.
 * Used to discover dependencies between batches.
 * @type {Map<Value, Batch> | null}
 */
export let stale_sources = null;

/** @type {Effect | null} */
let last_scheduled_effect = null;

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

	linked = false;

	/** @type {Batch | null} */
	merged_into = null;

	/**
	 * Effects that were executed with stale values. Its wv is written into the map.
	 * Lazily initialized for performance reasons.
	 * @type {Map<Effect, number> | null}
	 */
	#stale_effects = null;

	get stale_effects() {
		return (this.#stale_effects ??= new Map());
	}

	/**
	 * Reactions that, while running in an earlier batch, read a value that this batch holds
	 * a newer version of, and that are therefore scheduled to re-run in this batch. Used to
	 * avoid scheduling the same reaction multiple times when it reads more than one such value.
	 * Lazily initialized for performance reasons.
	 * @type {Set<Reaction> | null}
	 */
	#stale_readers = null;

	get stale_readers() {
		return (this.#stale_readers ??= new Set());
	}

	/** @type {Set<Effect>} */
	seen_effects = new Set();

	/** @type {Batch | null} */
	prev = null;

	/** @type {Batch | null} */
	next = null;

	/**
	 * Batches that depend on this batch.
	 * Lazily initialized for performance reasons.
	 * @type {Set<Batch> | null}
	 */
	#dependent = null;

	get dependent() {
		return (this.#dependent ??= new Set());
	}

	/**
	 * All started async work in this batch.
	 * Lazily initialized for performance reasons.
	 * @type {Map<Effect, ReturnType<typeof deferred<any>>> | null}
	 */
	#async_deriveds = null;

	get async_deriveds() {
		return (this.#async_deriveds ??= new Map());
	}

	/**
	 * The current values of any signals that are updated in this batch.
	 * `is_derived` is false for deriveds, too, if they were overridden via assignment.
	 * They keys of this map are identical to `this.previous`
	 * @type {Map<Value, { v: any, wv: number, is_derived: boolean }>}
	 */
	current = new Map();

	/**
	 * The values and write versions of any signals (sources and deriveds) that are updated in this batch _before_ those updates took place.
	 * They keys of this map are identical to `this.current`
	 * @type {Map<Value, { v: any, wv: number }>}
	 */
	previous = new Map();

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
	 * @type {Map<Effect, number> | null}
	 */
	#blocking_pending = null;

	/**
	 * A deferred that resolves when the batch is committed, used with `settled()`
	 * TODO replace with Promise.withResolvers once supported widely enough
	 * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
	 */
	#deferred = null;

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
	 * Deferred effects (which run after async work has completed) that are DIRTY
	 * @type {Set<Effect>}
	 */
	#dirty_effects = new Set();

	/**
	 * Deferred effects that are MAYBE_DIRTY
	 * @type {Set<Effect>}
	 */
	maybe_dirty_effects = new Set();

	/**
	 * Deferred deriveds that are DIRTY. We need to store these because a derived that definitely should execute
	 * might get executed in the meantime in another batch (they are lazy, so a DIRTY derived is not guaranteed
	 * to run immediately). Relying on wv_values is insufficient because if this derived has stale dependencies
	 * in this batch but is executed with latest dependencies elsewhere, the wv is bumped and would incorrectly
	 * say "hey we don't need to rerun this" in the context of this batch.
	 * Lazily initialized for performance reasons.
	 * @type {Set<Derived> | null}
	 */
	#dirty_deriveds = null;

	/**
	 * A map of branches that still exist, but will be destroyed when this batch
	 * is committed — we skip over these during `process`.
	 * The value contains child effects that were dirty/maybe_dirty before being reset,
	 * so they can be rescheduled if the branch survives.
	 * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
	 */
	#skipped_branches = new Map();

	/**
	 * Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing.
	 * `true` indicates that this branch is new to the eyes of this fork but was already created before.
	 * Lazily initialized for performance reasons.
	 * @type {Map<Effect, boolean> | null}
	 */
	#unskipped_branches = null;

	get unskipped_branches() {
		return (this.#unskipped_branches ??= new Map());
	}

	is_fork = false;

	is_eager = false;

	#decrement_queued = false;

	constructor() {
		// Put the new batch before the first forked batch
		let batch = first_batch;
		while (batch && !batch.is_fork) {
			batch = batch.next;
		}

		this.insert_before(batch);
		while (batch) {
			batch.id = uid++;
			batch = batch.next;
		}
	}

	#is_deferred() {
		if (this.is_fork) return true;
		if (this.#blocking_pending === null) return false;

		for (const effect of this.#blocking_pending.keys()) {
			var e = effect;
			var skipped = false;

			while (e.parent !== null) {
				if (this.#skipped_branches.has(e)) {
					skipped = true;
					break;
				}

				e = e.parent;
			}

			if (!skipped) {
				return true;
			}
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
		this.unskipped_branches.delete(effect);
	}

	/**
	 * Remove an effect from the #skipped_branches map and reschedule
	 * any tracked dirty/maybe_dirty child effects
	 * @param {Effect} effect
	 * @param {(e: Effect) => void} callback
	 * @param {boolean} is_fork_init
	 */
	unskip_effect(effect, callback = (e) => this.schedule(e), is_fork_init = false) {
		var tracked = this.#skipped_branches.get(effect);
		if (tracked) {
			this.#skipped_branches.delete(effect);

			for (var e of tracked.d) {
				set_signal_status(e, DIRTY);
				callback(e);
			}

			for (e of tracked.m) {
				set_signal_status(e, MAYBE_DIRTY);
				callback(e);
			}
		}
		if (!this.unskipped_branches.has(effect)) this.unskipped_branches.set(effect, is_fork_init);
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
		this.started = true;

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
		for (const e of this.#dirty_effects) {
			this.maybe_dirty_effects.delete(e);
			set_signal_status(e, DIRTY);
			this.schedule(e);
		}

		for (const e of this.maybe_dirty_effects) {
			if ((e.f & DIRTY) === 0) {
				set_signal_status(e, MAYBE_DIRTY);
				this.schedule(e);
			}
		}

		if (this.#dirty_deriveds !== null) {
			for (const d of this.#dirty_deriveds) {
				set_signal_status(d, DIRTY);
			}
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
				batch.schedule(e);
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
		this.#dirty_effects.clear();
		this.maybe_dirty_effects.clear();

		this.apply(true);

		// append/remove branches
		for (const fn of this.#commit_callbacks) fn(this);
		this.#commit_callbacks.clear();

		previous_batch = this;
		flush_queued_effects(render_effects);
		flush_queued_effects(effects);
		previous_batch = null;

		this.#deferred?.resolve();

		var next_batch = /** @type {Batch | null} */ (/** @type {unknown} */ (current_batch));

		if (this.#pending === 0 && (this.#scheduled.length === 0 || next_batch !== null)) {
			this.#unlink();
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
	 * Traverse the effect tree, executing effects or stashing
	 * them for later execution as appropriate
	 * @param {Effect} root
	 * @param {Effect[]} effects
	 * @param {Effect[]} render_effects
	 */
	#traverse(root, effects, render_effects) {
		root.f ^= CLEAN;

		var effect = root.first;
		var all_dirty = null;

		while (effect !== null) {
			if (all_dirty) {
				if (effect.f & CLEAN) effect.f ^= CLEAN;
				if ((effect.f & DIRTY) === 0) effect.f |= MAYBE_DIRTY;
			}

			var flags = effect.f;
			var is_branch = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
			var is_skippable_branch = is_branch && (flags & CLEAN) !== 0;

			var skip = is_skippable_branch || (flags & INERT) !== 0 || this.#skipped_branches.has(effect);

			if ((flags & FORK_ONLY_BRANCH) !== 0) {
				var first_time = this.unskipped_branches.get(effect);

				if (first_time === undefined) {
					skip = true;
					this.skip_effect(effect);
					reset_branch(
						effect,
						/** @type {{d: Effect[], m: Effect[]}} */ (this.#skipped_branches.get(effect))
					);
				} else if (first_time) {
					// We're seeing a fork-only branch for the first time in another fork. We need to traverse
					// all effects inside it (they're all marked MAYBE_DIRTY). This is necessary because
					// dependencies of the effects inside could've updated since the last time this branch ran.
					this.unskipped_branches.set(effect, false);
					all_dirty ??= effect;
					if (effect.f & CLEAN) effect.f ^= CLEAN;
					skip = false;
				}
			}

			if (!skip && effect.fn !== null) {
				if (is_branch) {
					effect.f ^= CLEAN;
				} else if ((flags & EFFECT) !== 0) {
					effects.push(effect);
				} else if (async_mode_flag && (flags & (RENDER_EFFECT | MANAGED_EFFECT)) !== 0) {
					render_effects.push(effect);
				} else {
					this.seen_effects.add(effect);
					if (is_dirty(effect)) {
						update_effect(effect);
					}
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

				if (effect === all_dirty) all_dirty = null;
			}
		}
	}

	#find_earlier_batch() {
		if (this.is_eager) return null;

		for (var batch = this.prev; batch !== null; batch = batch.prev) {
			if (!batch.is_fork && this.dependent.has(batch)) {
				return batch;
			}
		}

		return null;
	}

	/**
	 * Mark all reactive trees leading to block/async effects that (indirectly) depend on `value`
	 * @param {Value} value
	 * @param {number} status
	 * @param {boolean} not_yet - whether to mark effects that have not yet run, as opposed to those that have already run
	 */
	mark(value, status, not_yet = false) {
		var reactions = value.reactions;
		if (reactions === null) return false;

		let marked = false;

		for (const reaction of reactions) {
			var flags = reaction.f;

			if ((flags & DERIVED) !== 0) {
				var derived = /** @type {Derived} */ (reaction);

				// deriveds are traversed regardless of their status and only marked
				// if something downstream was marked, so that we don't dirty deriveds needlessly
				if (this.mark(derived, MAYBE_DIRTY, not_yet)) {
					set_signal_status(derived, status);
					marked = true;
				}
			} else {
				var effect = /** @type {Effect} */ (reaction);

				if (
					not_yet
						? !this.seen_effects.has(effect) &&
							!this.#dirty_effects.has(effect) &&
							!this.maybe_dirty_effects.has(effect)
						: (flags & (ASYNC | BLOCK_EFFECT)) === 0 || this.seen_effects.has(effect)
				) {
					this.maybe_dirty_effects.delete(effect);
					set_signal_status(effect, status);
					this.schedule(effect);
					marked = true;
				}
			}
		}

		return marked;
	}

	/**
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

		for (const b of batch.dependent) {
			if (b !== this) this.dependent.add(b);
		}

		for (let b = first_batch; b !== null; b = b.next) {
			if (b.dependent.has(batch)) {
				b.dependent.add(this);
			}
		}

		this.#pending += batch.#pending;
		if (batch.#blocking_pending !== null) {
			const blocking_pending = (this.#blocking_pending ??= new Map());
			for (const [effect, count] of batch.#blocking_pending) {
				blocking_pending.set(effect, (blocking_pending.get(effect) ?? 0) + count);
			}
		}

		for (const c of batch.#commit_callbacks) {
			this.oncommit(() => c(batch));
		}

		for (const c of batch.#discard_callbacks) {
			this.ondiscard(() => c(batch));
		}

		for (const [s, v] of batch.#skipped_branches) {
			this.#skipped_branches.set(s, v);
			this.unskipped_branches.delete(s);
		}

		for (const s of batch.unskipped_branches.keys()) {
			const v = this.#skipped_branches.get(s);
			if (v) {
				v.d = v.d.filter((e) => !batch.async_deriveds.has(e));
				v.m = v.m.filter((e) => !batch.async_deriveds.has(e));
			}
			this.unskip_effect(s);
		}

		// Clear them or else those that are still pending might get rejected on discard (after merged-into batch is done).
		// This can happen when batch Y merged into X and Y has a pending boundary and therefore still-pending async deriveds inside.
		batch.async_deriveds.clear();

		this.transfer_effects(batch.#dirty_effects, batch.maybe_dirty_effects, batch.#dirty_deriveds);

		this.oncommit(() => batch.discard());
		batch.#unlink();
		batch.merged_into = this;

		current_batch = this;
		this.#process();
	}

	/**
	 * @param {Effect[]} effects
	 */
	#defer_effects(effects) {
		for (var i = 0; i < effects.length; i += 1) {
			defer_effect(
				effects[i],
				this.#dirty_effects,
				this.maybe_dirty_effects,
				(this.#dirty_deriveds ??= new Set())
			);
		}
	}

	/**
	 * Associate a change to a given source with the current
	 * batch, noting its previous and current values
	 * @param {Value} source
	 * @param {any} value
	 * @param {boolean} [is_derived]
	 */
	capture(source, value, is_derived = false) {
		// Fast path for performance: When render/pre/user effects are flushed and this is the sole batch,
		// we don't need to capture the value
		if (
			is_derived &&
			current_batch === null &&
			previous_batch === this &&
			this.linked &&
			!this.is_fork &&
			this.prev === null &&
			this.next === null &&
			this.#pending === 0
		) {
			source.v = value;
			source.wv = increment_write_version();
			return;
		}

		// Separate method for further optimization; e.g. v8 does only need to invoke
		// CreateFunctionContext in this internal method due to capturing `this` in a closure.
		this.#capture(source, value, is_derived);
	}

	/**
	 * Keep callbacks that capture `this` out of the fast path above, so that taking it
	 * doesn't require allocating a function context.
	 * @param {Value} source
	 * @param {any} value
	 * @param {boolean} is_derived
	 */
	#capture(source, value, is_derived) {
		if (source.v !== UNINITIALIZED && !this.previous.has(source)) {
			this.previous.set(source, { v: source.v, wv: source.wv });
		}

		const wv = increment_write_version();

		// Don't save errors in `batch_values`, or they won't be thrown in `runtime.js#get`
		if ((source.f & ERROR_VALUE) === 0) {
			this.current.set(source, { v: value, wv, is_derived });
			batch_values?.set(source, value);
			wv_values?.set(source, wv);
		}

		// A derived computed from inputs that differ from the real values must stay batch-local.
		// This also happens when committing a later batch hides an earlier batch's pending writes.
		let is_latest_value =
			!this.is_fork &&
			(!is_derived ||
				batch_values === null ||
				!(
					/** @type {Derived} */ (source).deps?.some(
						(d) => batch_values?.has(d) && batch_values.get(d) !== d.v
					)
				));

		// A later batch may also own a newer value of the source or one of a derived's dependencies.
		// The check above isn't sufficient here: a later batch's write is visible through `batch_values`,
		// so comparing what was read against the real value could not attribute the value to the right
		// batch, see `async-dont-rebase-new-batch-4`. We only need to look one level deep: `is_dirty`
		// evaluates the top-most deriveds first, so a dependency derived that was itself not the latest
		// value was not written to the real world, and differs from our value for it.

		for (let batch = this.next; batch !== null && is_latest_value; batch = batch.next) {
			if (batch.is_fork) continue;

			if (
				batch.current.has(source) ||
				((source.f & DERIVED) !== 0 &&
					/** @type {Derived} */ (source).deps?.some(
						(d) =>
							/** @type {Batch} */ (batch).current.has(d) ||
							(this.current.has(d) && /** @type {{ v: any }} */ (this.current.get(d)).v !== d.v)
					))
			) {
				is_latest_value = false;
			}
		}

		if (is_latest_value) {
			source.v = value;
			source.wv = wv;
		}

		for (let batch = first_batch; batch !== null; batch = batch.next) {
			if (batch.id < this.id && batch.current.has(source)) {
				this.dependent.add(batch);
			}

			if (batch.is_fork && is_latest_value) {
				this.notify_fork(batch, source, is_derived, value);
			}
		}
	}

	/**
	 * Tell a fork batch that a source has been updated. Will delete that source from the fork,
	 * discarding it if it has no other sources left, and rerunning it else with the new value.
	 * @param {Batch} batch A fork
	 * @param {Value} source
	 * @param {boolean} is_derived
	 * @param {any} value
	 */
	notify_fork(batch, source, is_derived, value) {
		const current = batch.current.get(source);
		batch.current.delete(source);

		if (![...batch.current.values()].some((value) => !value.is_derived)) {
			// The real world has overtaken every write of this fork, so it is obsolete. Discard it
			// right away (its speculative branches must not be adopted by anyone), and empty
			// `current` so that `commit()` can tell this apart from a user-initiated discard
			batch.current.clear();
			batch.discard();
		} else {
			if (current && current.v !== value) batch.current.set(source, current);
			if (
				!is_derived &&
				(!current || current.v !== value) &&
				((source.f & ASYNC) === 0 ||
					!depends_on(
						/** @type {Effect} */ (/** @type {Source} */ (source).e),
						[...batch.current.keys()].filter((s) => !this.current.has(s)),
						new Map()
					))
			) {
				batch.current.delete(source);
				batch.queue_revalidation(source);
			}
		}
	}

	/** @param {Value} source */
	queue_revalidation(source) {
		queue_micro_task(() => {
			if (this.linked && this.mark(source, DIRTY)) {
				this.flush();
			}
		});
	}

	/**
	 * Activate batch - could be merged into another batch in the meantime,
	 * in which case that other batch becomes the active batch.
	 * @returns {Batch}
	 */
	activate() {
		return (current_batch = this.merged_into?.activate() ?? this);
	}

	deactivate() {
		current_batch = null;
		batch_values = null;
		wv_values = null;
	}

	flush() {
		try {
			if (DEV) {
				source_stacks.clear();
			}

			is_processing = true;
			current_batch = this;

			this.#process();
		} finally {
			flush_count = 0;
			last_scheduled_effect = null;
			collected_effects = null;
			legacy_updates = null;
			is_processing = false;

			current_batch = null;
			batch_values = null;
			wv_values = null;
			held_sources = null;
			stale_sources = null;

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

	/**
	 * @param {boolean} blocking
	 * @param {Effect} effect
	 */
	increment(blocking, effect) {
		this.#pending += 1;

		if (blocking) {
			const blocking_pending = (this.#blocking_pending ??= new Map());
			let blocking_pending_count = blocking_pending.get(effect) ?? 0;
			blocking_pending.set(effect, blocking_pending_count + 1);
		}
	}

	/**
	 * @param {boolean} blocking
	 * @param {Effect} effect
	 * @returns {void}
	 */
	decrement(blocking, effect) {
		if (this.merged_into) return this.merged_into.decrement(blocking, effect);

		this.#pending -= 1;

		if (blocking) {
			const blocking_pending = (this.#blocking_pending ??= new Map());
			let blocking_pending_count = blocking_pending.get(effect) ?? 0;

			if (blocking_pending_count === 1) {
				blocking_pending.delete(effect);
			} else {
				blocking_pending.set(effect, blocking_pending_count - 1);
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
	 * @param {Set<Effect>} dirty_effects
	 * @param {Set<Effect>} maybe_dirty_effects
	 * @param {Set<Derived> | null} dirty_deriveds
	 * @returns {void}
	 */
	transfer_effects(dirty_effects, maybe_dirty_effects, dirty_deriveds) {
		if (this.merged_into) {
			return this.merged_into.transfer_effects(dirty_effects, maybe_dirty_effects, dirty_deriveds);
		}

		for (const e of dirty_effects) {
			this.#dirty_effects.add(e);
		}

		for (const e of maybe_dirty_effects) {
			this.maybe_dirty_effects.add(e);
		}

		if (dirty_deriveds !== null) {
			for (const d of dirty_deriveds) {
				(this.#dirty_deriveds ??= new Set()).add(d);
			}
		}

		dirty_effects.clear();
		maybe_dirty_effects.clear();
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

			if (!is_processing) {
				queue_micro_task(() => {
					if (!batch.started) {
						batch.flush();
					}
				});
			}
		}

		return current_batch;
	}

	apply(include_earlier = false) {
		if (!async_mode_flag || (!this.is_fork && this.prev === null && this.next === null)) {
			batch_values = null;
			wv_values = null;
			stale_sources = null;
			return;
		}

		// if there are multiple batches, we are 'time travelling' —
		// we need to override values with the ones in this batch...
		batch_values = new Map();
		wv_values = new Map();
		held_sources = new Map();
		stale_sources = new Map();

		for (const [source, current] of this.current) {
			batch_values.set(source, current.v);
			wv_values.set(source, current.wv);
		}

		for (const [effect, wv] of this.stale_effects) {
			wv_values.set(effect, wv);
		}

		for (let batch = first_batch; batch !== null; batch = batch.next) {
			if (batch === this) continue;

			if (batch.id < this.id) {
				for (const source of batch.current.keys()) {
					held_sources.set(source, batch);
				}
			}

			if (batch.is_fork) continue;

			if (batch.id > this.id || this.is_eager) {
				for (const source of batch.current.keys()) {
					if (!this.current.has(source)) stale_sources.set(source, batch);
				}
			}

			if (batch.id > this.id || include_earlier || this.is_eager) {
				for (const [source, previous] of batch.previous) {
					if (!batch_values.has(source)) {
						batch_values.set(source, previous.v);
						wv_values.set(source, previous.wv);
					}
				}
			}
		}
	}

	/**
	 *
	 * @param {Effect} effect
	 */
	schedule(effect) {
		last_scheduled_effect = effect;

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

	/** @param {Batch | null} next `null` appends to the end of the list */
	insert_before(next) {
		this.#unlink();
		this.prev = next === null ? last_batch : next.prev;
		this.next = next;

		if (this.prev === null) first_batch = this;
		else this.prev.next = this;

		if (next === null) last_batch = this;
		else next.prev = this;

		this.linked = true;
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
			flushSync(); // drain queue via the lower while(true) part

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
 * @param {Reaction} reaction
 * @param {Value[]} sources
 * @param {Map<Reaction, boolean>} checked
 */
function depends_on(reaction, sources, checked) {
	const depends = checked.get(reaction);
	if (depends !== undefined) return depends;

	if (reaction.deps !== null) {
		for (const dep of reaction.deps) {
			if (includes.call(sources, dep)) {
				return true;
			}

			if ((dep.f & DERIVED) !== 0 && depends_on(/** @type {Derived} */ (dep), sources, checked)) {
				checked.set(/** @type {Derived} */ (dep), true);
				return true;
			}
		}
	}

	checked.set(reaction, false);

	return false;
}

/**
 * @param {Effect} effect
 * @returns {void}
 */
export function schedule_effect(effect) {
	/** @type {Batch} */ (current_batch).schedule(effect);
}

/** @type {Source<number>[]} */
let eager_versions = [];

function eager_flush() {
	flushSync(() => {
		var batch = Batch.ensure();
		batch.is_eager = true;
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

	var committed = false;
	/** @type {Promise<void>} */
	var settled;
	/** @type {Batch} */
	var batch;

	flushSync(() => {
		batch = Batch.ensure();
		batch.is_fork = true;
		batch_values = new Map();
		wv_values = new Map();
		settled = batch.settled();

		fn();
	});

	return {
		commit: async () => {
			if (committed) {
				await settled;
				return;
			}

			if (batch.current.size === 0) {
				// Nothing to commit: either the fork never wrote anything (e.g. it assigned a value
				// that was already current), or the real world has since written to every source
				// it did write to and the fork was discarded as obsolete (see `notify_fork`)
				committed = true;
				batch.discard();
				return;
			}

			if (!batch.linked) {
				e.fork_discarded();
			}

			committed = true;

			batch.is_fork = false;

			// Keep IDs in order, then move the batch before all remaining forks
			let before = batch;
			while (before.prev?.is_fork) {
				const prev = before.prev;
				const id = batch.id;
				batch.id = prev.id;
				prev.id = id;
				before = prev;
			}
			if (before !== batch) batch.insert_before(before);

			// Apply changes and update write versions so deriveds see the change. Everything still
			// in `batch.current` at this point is the latest value: sources that the real world has
			// written to in the meantime were removed from the fork via `notify_fork` (an async
			// source only survives if its effect depends on inputs that only the fork changed).
			// We use fresh versions rather than the fork-time `content.wv`, because the real world
			// may have run reactions since then whose versions would otherwise outrank them.
			for (var [source, content] of batch.current) {
				var changed = source.v !== content.v;
				source.v = content.v;

				if (!content.is_derived) {
					content.wv = source.wv = increment_write_version();
					// dirty those effects the fork did not see yet, e.g. because a later batch created new branches
					batch.mark(source, MAYBE_DIRTY, true);
				} else if (changed) {
					// A derived that was evaluated inside the fork: bump its version too, so that reactions
					// which read the (then still old) real value _after_ the fork evaluated it — and which are
					// therefore not in `stale_effects` — see a newer dependency version and re-run.
					content.wv = source.wv = increment_write_version();
				}
			}

			// All the block/async effects the fork executed are now guaranteed to be up to date
			for (const effect of batch.stale_effects.keys()) {
				effect.wv = write_version;
			}
			batch.stale_effects.clear();

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

			// Promote fork-only branches to the real world
			for (const e of batch.unskipped_branches.keys()) {
				if (e.f & FORK_ONLY_BRANCH) {
					e.f ^= FORK_ONLY_BRANCH;
				}
			}

			batch.flush();

			// Other forks might need to rerun now with the updated state.
			let next_batch = batch.next;
			while (next_batch) {
				for (const [source, current] of batch.current) {
					if (next_batch.current.has(source)) {
						batch.notify_fork(next_batch, source, current.is_derived, current.v);
					} else if (!current.is_derived) {
						next_batch.queue_revalidation(source);
					}
				}
				next_batch = next_batch.next;
			}

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

/** @import { Fork } from 'svelte' */
/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */
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
	STALE_REACTION
} from '#client/constants';
import { async_mode_flag } from '../../flags/index.js';
import { deferred, define_property } from '../../shared/utils.js';
import {
	active_effect,
	active_reaction,
	get,
	increment_write_version,
	is_dirty,
	update_effect
} from '../runtime.js';
import * as e from '../errors.js';
import { flush_tasks, queue_micro_task } from '../dom/task.js';
import { DEV } from 'esm-env';
import { invoke_error_boundary } from '../error-handling.js';
import { flush_eager_effects, old_values, set_eager_effects, source, update } from './sources.js';
import { eager_effect, unlink_effect } from './effects.js';
import { defer_effect } from './utils.js';
import { UNINITIALIZED } from '../../../constants.js';
import { set_signal_status } from './status.js';
import { legacy_is_updating_store } from './store.js';
import { log_effect_tree } from '../dev/debug.js';

/** @type {Set<Batch>} */
const batches = new Set();

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
var source_stacks = DEV ? new Set() : null;

let uid = 1;

export class Batch {
	id = uid++;

	/**
	 * The current values of any signals that are updated in this batch.
	 * Tuple format: [value, is_derived] (note: is_derived is false for deriveds, too, if they were overridden via assignment)
	 * They keys of this map are identical to `this.#previous`
	 * @type {Map<Value, [any, boolean]>}
	 */
	current = new Map();

	/**
	 * The values of any signals (sources and deriveds) that are updated in this batch _before_ those updates took place.
	 * They keys of this map are identical to `this.#current`
	 * @type {Map<Value, any>}
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
	 * Async effects that are currently in flight
	 * @type {Map<Effect, number>}
	 */
	#pending = new Map();

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
	 * Async derived reject handlers currently associated with this batch.
	 * Value indicates whether the corresponding async derived is outdated.
	 * @type {Map<(reason: unknown) => void, Effect | null>}
	 */
	async_deriveds = new Map();

	/**
	 * The root effects that need to be flushed
	 * @type {Effect[]}
	 */
	#roots = [];

	/**
	 * Effects created while this batch was active.
	 * @type {Effect[]}
	 */
	#new_effects = [];

	/**
	 * Deferred effects (which run after async work has completed) that are DIRTY
	 * @type {Set<Effect>}
	 */
	#dirty_effects = new Set();

	/**
	 * Deferred effects that are MAYBE_DIRTY
	 * @type {Set<Effect>}
	 */
	#maybe_dirty_effects = new Set();

	/**
	 * A map of branches that still exist, but will be destroyed when this batch
	 * is committed — we skip over these during `process`.
	 * The value contains child effects that were dirty/maybe_dirty before being reset,
	 * so they can be rescheduled if the branch survives.
	 * @type {Map<Effect, { d: Set<Effect>, m: Set<Effect> }>}
	 */
	#skipped_branches = new Map();

	is_fork = false;
	was_fork = false;

	#decrement_queued = false;

	/** @type {Set<Batch>} */
	blockers = new Set();

	/** True if this batch was made obsolete because subsequent batches combined cover all async work this one did */
	obsolete = false;

	#is_deferred() {
		return this.is_fork || this.#blocking_pending.size > 0;
	}

	#get_blockers() {
		const blockers = [];

		for (const batch of [...this.blockers].sort((a, b) => b.id - a.id)) {
			for (const effect of batch.#blocking_pending.keys()) {
				var skipped = false;
				var e = effect;

				while (e.parent !== null) {
					if (this.#skipped_branches.has(e)) {
						skipped = true;
						break;
					}

					e = e.parent;
				}

				if (!skipped) {
					blockers.push(batch);
					break;
				}
			}
		}

		return blockers;
	}

	/**
	 * Add an effect to the #skipped_branches map and reset its children
	 * @param {Effect} effect
	 */
	skip_effect(effect) {
		if (!this.#skipped_branches.has(effect)) {
			this.#skipped_branches.set(effect, { d: new Set(), m: new Set() });
		}
	}

	/**
	 * Remove an effect from the #skipped_branches map and reschedule
	 * any tracked dirty/maybe_dirty child effects
	 * @param {Effect} effect
	 */
	unskip_effect(effect) {
		var tracked = this.#skipped_branches.get(effect);
		if (tracked) {
			this.#skipped_branches.delete(effect);

			for (var e of tracked.d) {
				set_signal_status(e, DIRTY);
				this.schedule(e);
			}

			for (e of tracked.m) {
				set_signal_status(e, MAYBE_DIRTY);
				this.schedule(e);
			}
		}
	}

	#process() {
		if (flush_count++ > 1000) {
			batches.delete(this);
			infinite_loop_guard();
		}

		// we only reschedule previously-deferred effects if we expect
		// to be able to run them after processing the batch
		if (!this.#is_deferred()) {
			for (const e of this.#dirty_effects) {
				this.#maybe_dirty_effects.delete(e);
				set_signal_status(e, DIRTY);
				this.schedule(e);
			}

			for (const e of this.#maybe_dirty_effects) {
				set_signal_status(e, MAYBE_DIRTY);
				this.schedule(e);
			}
		}

		const roots = this.#roots;
		this.#roots = [];

		// For #traverse we want to ignore previous values of prior batches, i.e. we want to see the latest values up to this batch
		this.#apply(false);

		/** @type {Effect[]} */
		var effects = (collected_effects = []);

		/** @type {Effect[]} */
		var render_effects = [];

		/**
		 * @type {Effect[]}
		 * @deprecated when we get rid of legacy mode and stores, we can get rid of this
		 */
		var updates = (legacy_updates = []);

		for (const root of roots) {
			try {
				this.#traverse(root, effects, render_effects);
			} catch (e) {
				reset_all(root);
				throw e;
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

		const blockers = this.#get_blockers();
		const is_deferred = this.#is_deferred();

		if (is_deferred || blockers.length > 0) {
			this.#defer_effects(render_effects);
			this.#defer_effects(effects);

			for (const [e, t] of this.#skipped_branches) {
				reset_branch(e, t);
			}

			if (!is_deferred) {
				Promise.all(blockers.map((b) => b.settled())).then(() => {
					this.flush();
				});
			}
		} else {
			// During deferred effect flushing, also account for prior batches' previous values.
			// This is necessary because an earlier batch could be independent to this one with
			// respects to the sources etc it touches, so the later one can resolve before the earlier one.
			this.#apply(true);

			if (this.#pending.size === 0) {
				batches.delete(this);
			}

			// clear effects. Those that are still needed will be rescheduled through unskipping the skipped branches.
			this.#dirty_effects.clear();
			this.#maybe_dirty_effects.clear();

			// append/remove branches
			for (const fn of this.#commit_callbacks) fn(this);
			this.#commit_callbacks.clear();

			previous_batch = this;
			flush_queued_effects(render_effects);
			flush_queued_effects(effects);
			previous_batch = null;
			this.#schedule_new_effects_on_prior_batches();

			this.#deferred?.resolve();
			// TODO can a source within a branch contributing to this.#pending (instead of this.#blocking_pending) be the reason for blocking the batch?
			for (const batch of batches) {
				batch.blockers.delete(this);
			}
		}

		var next_batch = /** @type {Batch | null} */ (/** @type {unknown} */ (current_batch));

		// Edge case: During traversal new branches might create effects that run immediately and set state,
		// causing an effect and therefore a root to be scheduled again. We need to traverse the current batch
		// once more in that case - most of the time this will just clean up dirty branches.
		if (this.#roots.length > 0) {
			const batch = (next_batch ??= this);
			batch.#roots.push(...this.#roots.filter((r) => !batch.#roots.includes(r)));
		}

		if (next_batch !== null) {
			batches.add(next_batch);

			if (DEV) {
				for (const source of this.current.keys()) {
					/** @type {Set<Source>} */ (source_stacks).add(source);
				}
			}

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

		while (effect !== null) {
			var flags = effect.f;
			var is_branch = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
			var is_skippable_branch = is_branch && (flags & CLEAN) !== 0;

			var skip = is_skippable_branch || (flags & INERT) !== 0 || this.#skipped_branches.has(effect);

			if (!skip && effect.fn !== null) {
				if (is_branch) {
					effect.f ^= CLEAN;
				} else if ((flags & EFFECT) !== 0) {
					effects.push(effect);
				} else if (async_mode_flag && (flags & (RENDER_EFFECT | MANAGED_EFFECT)) !== 0) {
					render_effects.push(effect);
				} else if (is_dirty(effect)) {
					if ((flags & BLOCK_EFFECT) !== 0) this.#maybe_dirty_effects.add(effect);
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

	/**
	 * @param {Effect[]} effects
	 */
	#defer_effects(effects) {
		for (var i = 0; i < effects.length; i += 1) {
			defer_effect(effects[i], this.#dirty_effects, this.#maybe_dirty_effects);
		}
	}

	/**
	 * Associate a change to a given source with the current
	 * batch, noting its previous and current values
	 * @param {Value} source
	 * @param {any} old_value
	 * @param {boolean} [is_derived]
	 */
	capture(source, old_value, is_derived = false) {
		if (old_value !== UNINITIALIZED && !this.previous.has(source)) {
			this.previous.set(source, old_value);
		}

		// Don't save errors in `batch_values`, or they won't be thrown in `runtime.js#get`
		if ((source.f & ERROR_VALUE) === 0) {
			this.current.set(source, [source.v, is_derived]);
			batch_values?.set(source, source.v);
		}
	}

	activate() {
		current_batch = this;
		this.#apply(false);
	}

	deactivate() {
		current_batch = null;
		batch_values = null;
	}

	flush() {
		var source_stacks = DEV ? new Set() : null;

		try {
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

			old_values.clear();

			if (DEV) {
				for (const source of /** @type {Set<Source>} */ (source_stacks)) {
					source.updated = null;
				}
			}
		}
	}

	discard() {
		for (const fn of this.#discard_callbacks) fn(this);
		this.#discard_callbacks.clear();

		batches.delete(this);
		this.#deferred?.resolve();
	}

	/**
	 * @param {boolean} blocking
	 * @param {Effect} effect
	 */
	increment(blocking, effect) {
		let pending_count = this.#pending.get(effect) ?? 0;
		this.#pending.set(effect, pending_count + 1);

		if (blocking) {
			let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
			this.#blocking_pending.set(effect, blocking_pending_count + 1);
		}
	}

	/**
	 * @param {boolean} blocking
	 * @param {Effect} effect
	 * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
	 */
	decrement(blocking, effect, skip) {
		let pending_count = this.#pending.get(effect) ?? 0;

		if (pending_count === 1) {
			this.#pending.delete(effect);
		} else {
			this.#pending.set(effect, pending_count - 1);
		}

		if (blocking) {
			let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;

			if (blocking_pending_count === 1) {
				this.#blocking_pending.delete(effect);
			} else {
				this.#blocking_pending.set(effect, blocking_pending_count - 1);
			}
		}

		if (this.#decrement_queued || skip) return;
		this.#decrement_queued = true;

		queue_micro_task(() => {
			this.#decrement_queued = false;
			// skip=false does not necessarily mean that this wasn't supposed to be a skip
			// (various callsites cannot reliably tell without bloating code), therefore
			// check if the batch was made obsolete in the meantime before flushing.
			if (batches.has(this)) this.flush();
		});
	}

	/**
	 * @param {Set<Effect>} dirty_effects
	 * @param {Set<Effect>} maybe_dirty_effects
	 */
	transfer_effects(dirty_effects, maybe_dirty_effects) {
		for (const e of dirty_effects) {
			this.#dirty_effects.add(e);
		}

		for (const e of maybe_dirty_effects) {
			this.#maybe_dirty_effects.add(e);
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

	/**
	 * Marks an async run as outdated. If all async runs are outdated, the batch as a whole is obsolete.
	 * All its async deriveds then have resolved successors which means we discard this batch.
	 * @param {(reason: unknown) => void} reject
	 */
	reject_async(reject) {
		if (!this.async_deriveds.has(reject)) return;

		const effect = this.async_deriveds.get(reject);
		this.async_deriveds.set(reject, null);

		for (const effect of this.async_deriveds.values()) {
			if (effect) return;
		}

		for (const reject of this.async_deriveds.keys()) {
			reject(STALE_REACTION);
		}

		this.async_deriveds.clear();

		for (const batch of batches) {
			if (batch.id <= this.id) continue;

			if (batch.async_deriveds.values().some((e) => e === effect)) {
				this.#merge_into(batch);
				return;
			}
		}
	}

	/**
	 * Merge this batch's state into a newer superseding batch.
	 * @param {Batch} target
	 */
	#merge_into(target) {
		if (target === this) return;

		// TODO check what of this we actually need to merge, maybe we can shrink this method a bit

		for (const [source, info] of this.current) {
			if (!target.current.has(source)) {
				target.current.set(source, info);
			}
		}

		for (const [source, value] of this.previous) {
			target.previous.set(source, value);
		}

		target.transfer_effects(this.#dirty_effects, this.#maybe_dirty_effects);

		for (const fn of this.#commit_callbacks) {
			target.#commit_callbacks.add(() => fn(this));
		}
		this.#commit_callbacks.clear();

		for (const fn of this.#discard_callbacks) {
			target.#discard_callbacks.add(() => fn(this));
		}
		this.#discard_callbacks.clear();

		for (const [effect, tracked] of this.#skipped_branches) {
			var existing = target.#skipped_branches.get(effect);

			if (existing === undefined) {
				target.#skipped_branches.set(effect, tracked);
			} else {
				for (const e of tracked.d) {
					existing.d.add(e);
				}

				for (const e of tracked.m) {
					existing.m.add(e);
				}
			}
		}
		this.#skipped_branches.clear();

		for (const root of this.#roots) {
			if (!target.#roots.includes(root)) {
				target.#roots.push(root);
			}
		}
		this.#roots = [];

		// No need to merge pending/block_pending, these are already at 0 and obsolete else we couldn't merge into the target batch

		for (const blocker of this.blockers) {
			if (blocker !== target) {
				target.blockers.add(blocker);
			}
		}
		this.blockers.clear();

		batches.delete(this);
		this.obsolete = true;

		for (const batch of batches) {
			if (!batch.blockers.has(this)) continue;

			batch.blockers.delete(this);
			if (batch !== target) {
				batch.blockers.add(target);
			}
		}

		this.#deferred?.resolve();
	}

	settled() {
		return (this.#deferred ??= deferred()).promise;
	}

	static ensure() {
		if (current_batch === null) {
			const batch = (current_batch = new Batch());

			if (!is_processing) {
				batches.add(current_batch);

				if (!is_flushing_sync) {
					queue_micro_task(() => {
						if (current_batch !== batch) {
							// a flushSync happened in the meantime
							return;
						}

						batch.flush();
					});
				}
			}
		}

		return current_batch;
	}

	/**
	 * @param {boolean} include_prior_previous
	 */
	#apply(include_prior_previous) {
		if (!async_mode_flag || (!this.is_fork && batches.size === 1)) {
			batch_values = null;
			return;
		}

		// if there are multiple batches, we are 'time travelling' —
		// we need to override values with the ones in this batch...
		batch_values = new Map();
		for (const [source, [value]] of this.current) {
			batch_values.set(source, value);
		}

		// ...and undo changes belonging to other batches unless they block this one
		for (const batch of batches) {
			if (batch === this || batch.is_fork) continue;

			// A batch is blocked on an earlier batch if it overlaps with the earlier batch's changes but is not a superset
			var intersects = false;
			var differs = false;

			if (batch.id < this.id) {
				for (const [source, [, is_derived]] of batch.current) {
					// Derived values don't partake in the blocking mechanism, because a derived could
					// be triggered in one batch already but not the other one yet, causing a false-positive
					if (is_derived) continue;

					intersects ||= this.current.has(source);
					differs ||= !this.current.has(source);
				}
			}

			if (intersects && differs) {
				this.blockers.add(batch);
			} else {
				if (batch.id < this.id && !include_prior_previous) {
					continue;
				}

				for (const [source, previous] of batch.previous) {
					if (!batch_values.has(source)) {
						batch_values.set(source, previous);
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

		var e = effect;

		while (e.parent !== null) {
			e = e.parent;
			var flags = e.f;

			// if the effect is being scheduled because a parent (each/await/etc) block
			// updated an internal source, or because a branch is being unskipped,
			// bail out or we'll cause a second flush
			if (collected_effects !== null && e === active_effect) {
				if (async_mode_flag) return;

				// in sync mode, render effects run during traversal. in an extreme edge case
				// — namely that we're setting a value inside a derived read during traversal —
				// they can be made dirty after they have already been visited, in which
				// case we shouldn't bail out. we also shouldn't bail out if we're
				// updating a store inside a `$:`, since this might invalidate
				// effects that were already visited
				if (
					(active_reaction === null || (active_reaction.f & DERIVED) === 0) &&
					!legacy_is_updating_store
				) {
					return;
				}
			}

			if ((flags & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
				if ((flags & CLEAN) === 0) {
					// branch is already dirty, bail
					return;
				}

				e.f ^= CLEAN;
			}
		}

		this.#roots.push(e);
	}

	/**
	 * @param {Effect} effect
	 */
	register_created_effect(effect) {
		this.#new_effects.push(effect);
	}

	/**
	 * Schedule those effects created in this batch on prior batches
	 * which depend on a signal modified by that prior batch. Else
	 * the prior batch wouldn't know of these effects and could not
	 * update them, resulting in e.g. stale values being rendered.
	 *
	 * We need this in addition to the `mark_blocked_by`-logic because
	 * the `mark_blocked_by`-logic cannot handle forks committing
	 * after a new branch was created and comitted in another batch
	 * (see test async-state-new-branch-4/5), and this logic cannot handle
	 * blocking on prior batches to prevent showing pending values
	 * on new branches (see test async-state-new-branch-1/2/3).
	 *
	 * If this was a fork that's now committed, also reschedule async deriveds
	 * in other batches that depend on a fork's current value, because they
	 * might be pending with an outdated value otherwise.
	 */
	#schedule_new_effects_on_prior_batches() {
		for (const batch of batches) {
			if (batch === this) continue;

			if (batch.id < this.id) {
				for (const effect of this.#new_effects) {
					if (
						(effect.f & (DESTROYED | INERT | EAGER_EFFECT)) === 0 &&
						// TODO filter batch.current down to only the signals that are not equal to this.current?
						reaction_depends_on_signals(effect, batch.current, new Set())
					) {
						set_signal_status(effect, DIRTY);
						batch.schedule(effect);
					}
				}
			}

			if (this.was_fork) {
				for (const effect of batch.async_deriveds.values()) {
					// TODO filter this.current down to only the signals that are not equal to batch.current?
					if (effect && reaction_depends_on_signals(effect, this.current, new Set())) {
						set_signal_status(effect, DIRTY);
						batch.schedule(effect);
					}
				}
			}
		}

		this.#new_effects = [];
		// No need to flush here, if those batches are still in the set,
		// they are pending and so will be flushed at some point
	}

	/**
	 * If an effect/derived is running for the first time and reads a signal that
	 * belongs to an earlier batch, this batch must wait for that earlier batch.
	 * @param {Value} signal
	 */
	mark_blocked_by(signal) {
		for (const batch of batches) {
			if (batch === this) break;

			if (!batch.is_fork && batch.current.has(signal)) {
				this.blockers.add(batch);
			}
		}
	}
}

/**
 * Synchronously flush any pending updates.
 * Returns void if no callback is provided, otherwise returns the result of calling the callback.
 * @template [T=void]
 * @param {(() => T) | undefined} [fn]
 * @returns {T}
 */
export function flushSync(fn) {
	var was_flushing_sync = is_flushing_sync;
	is_flushing_sync = true;

	try {
		var result;

		if (fn) {
			if (current_batch !== null && !current_batch.is_fork) {
				current_batch.flush();
			}

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
 * Returns true if `reaction` depends (directly or via deriveds) on any signal in `signals`.
 * @param {Reaction} reaction
 * @param {Pick<Map<Value, any>, 'has'>} signals
 * @param {Set<Derived>} visited
 * @returns {boolean}
 */
function reaction_depends_on_signals(reaction, signals, visited) {
	var deps = reaction.deps;
	if (deps === null) return false;

	for (const dep of deps) {
		if (signals.has(dep)) {
			return true;
		}

		if ((dep.f & DERIVED) !== 0) {
			var derived = /** @type {Derived} */ (dep);

			if (visited.has(derived)) continue;
			visited.add(derived);

			if (reaction_depends_on_signals(derived, signals, visited)) {
				return true;
			}
		}
	}

	return false;
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
 * @returns {void}
 */
export function schedule_effect(effect) {
	/** @type {Batch} */ (current_batch).schedule(effect);
}

/** @type {Source<number>[]} */
let eager_versions = [];

function eager_flush() {
	try {
		flushSync(() => {
			for (const version of eager_versions) {
				update(version);
			}
		});
	} finally {
		eager_versions = [];
	}
}

/**
 * Implementation of `$state.eager(fn())`
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
export function eager(fn) {
	var version = source(0);
	var initial = true;
	var value = /** @type {T} */ (undefined);

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
 * @param {{ d: Set<Effect>, m: Set<Effect> }} tracked
 */
function reset_branch(effect, tracked) {
	// clean branch = nothing dirty inside, no need to traverse further
	if ((effect.f & BRANCH_EFFECT) !== 0 && (effect.f & CLEAN) !== 0) {
		return;
	}

	if ((effect.f & DIRTY) !== 0) {
		tracked.d.add(effect);
	} else if ((effect.f & MAYBE_DIRTY) !== 0) {
		tracked.m.add(effect);
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

	var batch = Batch.ensure();
	batch.is_fork = batch.was_fork = true;
	batch_values = new Map();

	var committed = false;
	var settled = batch.settled();

	flushSync(fn);

	// revert state changes
	for (var [source, value] of batch.previous) {
		source.v = value;
	}

	return {
		commit: async () => {
			if (committed) {
				await settled;
				return;
			}

			// Don't error if batch was made obsolete; user cannot really know
			if (batch.obsolete) return;

			if (!batches.has(batch)) {
				e.fork_discarded();
			}

			committed = true;

			batch.is_fork = false;

			// apply changes and update write versions so deriveds see the change
			for (var [source, [value]] of batch.current) {
				source.v = value;
				source.wv = increment_write_version();
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
			// cause any MAYBE_DIRTY deriveds to update
			// if they depend on things thath changed
			// inside the discarded fork
			for (var source of batch.current.keys()) {
				source.wv = increment_write_version();
			}

			if (!committed && batches.has(batch)) {
				batch.discard();
			}
		}
	};
}

/**
 * Forcibly remove all current batches, to prevent cross-talk between tests
 */
export function clear() {
	batches.clear();
}

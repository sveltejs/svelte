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
	DESTROYING,
	USER_EFFECT,
	TEMPLATE_EXPRESSION
} from '#client/constants';
import { async_mode_flag } from '../../flags/index.js';
import { deferred, define_property } from '../../shared/utils.js';
import {
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
import {
	eager_effects,
	flush_eager_effects,
	mark_reactions,
	old_values,
	source,
	update
} from './sources.js';
import { eager_effect, teardown, unlink_effect } from './effects.js';
import { defer_effect } from './utils.js';
import { UNINITIALIZED } from '../../../constants.js';
import { set_signal_status } from './status.js';
import { OBSOLETE } from './deriveds.js';
import * as w from '../warnings.js';

const MAX_ENTANGLED_RESTARTS = 10;

/** @type {Batch | null} */
let first_batch = null;

/** @type {Batch | null} */
let last_batch = null;

/** @type {Batch | null} */
export let current_batch = null;

/**
 * The batch whose world is currently applied. This can differ from
 * `current_batch`, e.g. while a batch's effects are being flushed (during which
 * `current_batch` is `null`, or a new batch created by writes inside effects).
 * @type {Batch | null}
 */
export let active_batch = null;

/**
 * This is needed to avoid overwriting inputs
 * @type {Batch | null}
 */
export let previous_batch = null;

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

let effect_version = 1;

/** @type {WeakMap<Effect, number>} */
const effect_versions = new WeakMap();

/**
 * @template T
 * @param {Set<T> | null} target
 * @param {Set<T> | null} source
 * @returns {Set<T> | null}
 */
function transfer_set(target, source) {
	if (source === null || source.size === 0) return target;

	target ??= new Set();

	for (const value of source) {
		target.add(value);
	}

	source.clear();
	return target;
}

export class Batch {
	id = uid++;

	/** True as soon as `#process` was called */
	#started = false;

	linked = true;

	/** @type {Batch | null} */
	#prev = null;

	/** @type {Batch | null} */
	#next = null;

	/**
	 * Lazily initialised for perf reasons
	 * @type {Map<Effect, ReturnType<typeof deferred<any>> & { id: number }> | null}
	 */
	async_deriveds = null;

	/**
	 * The current values of any sources that are updated in this batch
	 * (including deriveds that were overridden via assignment)
	 * @type {Map<Value, any>}
	 */
	current = new Map();

	/**
	 * The values of any signals (sources and deriveds) that are updated in this
	 * batch _before_ those updates took place. Other, non-overlapping batches
	 * use these to keep operating against the pre-write world until this batch commits
	 * @type {Map<Value, any>}
	 */
	previous = new Map();

	/**
	 * The values visible in this batch's world. Entries are `[value, owner]`
	 * tuples. `owner` is the live batch whose pre-write value we are seeing,
	 * or `null` if the value belongs to this batch. For forks this also stores
	 * world-local derived values between activations.
	 * @type {Map<Value, [any, Batch | null]> | null}
	 */
	values = null;

	/**
	 * When the batch is committed (and the DOM is updated), we need to remove old branches
	 * and append new ones by calling the functions added inside (if/each/key/etc) blocks.
	 * Lazily initialised for perf reasons.
	 * @type {Set<(batch: Batch) => void> | null}
	 */
	#commit_callbacks = null;

	/**
	 * If a fork is discarded, we need to destroy any effects that are no longer needed.
	 * Lazily initialised for perf reasons
	 * @type {Set<(batch: Batch) => void> | null}
	 */
	#discard_callbacks = null;

	/**
	 * The number of async effects that are currently in flight
	 */
	#pending = 0;

	/**
	 * Async effects that are currently in flight, _not_ inside a pending boundary.
	 * Lazily initialised for perf reasons
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
	 * Deferred effects (which run after async work has completed) that are DIRTY.
	 * Lazily initialised for perf reasons
	 * @type {Set<Effect> | null}
	 */
	#dirty_effects = null;

	/**
	 * Deferred effects that are MAYBE_DIRTY.
	 * Lazily initialised for perf reasons
	 * @type {Set<Effect> | null}
	 */
	#maybe_dirty_effects = null;

	/**
	 * Effects run by an eager batch that must be re-established in this batch's world.
	 * Unlike deferred effects, these are scheduled only once.
	 * Lazily initialised for perf reasons
	 * @type {Set<Effect> | null}
	 */
	#reestablish_effects = null;

	/**
	 * A map of branches that still exist, but will be destroyed when this batch
	 * is committed — we skip over these during `process`.
	 * The value contains child effects that were dirty/maybe_dirty before being reset,
	 * so they can be rescheduled if the branch survives.
	 * Lazily initialised for perf reasons.
	 * @type {Map<Effect, { d: Effect[], m: Effect[] }> | null}
	 */
	#skipped_branches = null;

	is_fork = false;

	/**
	 * `true` for batches created by `$state.eager` version bumps. Like template
	 * expressions, these are 'leaves' — they re-run affected template/block
	 * effects immediately in their own world, without entangling other batches
	 */
	is_eager = false;

	/**
	 * If this batch was merged into another one (because their reactivity graphs
	 * turned out to overlap), this points to the batch it was merged into. Stale
	 * references to this batch (claims on reactions, batches captured in async
	 * closures, etc) are forwarded to the survivor
	 * @type {Batch | null}
	 */
	merged_into = null;

	/**
	 * Async and block effects that ran or were proven clean inside this fork.
	 * The version is that of the latest real-world execution when the effect was
	 * validated. Fork executions do not advance it, so forks remain independent.
	 * Lazily initialised for perf reasons
	 * @type {Map<Effect, number> | null}
	 */
	fork_effects = null;

	/**
	 * Reactions that observed the pre-write world of this batch via its active
	 * overlay while it was pending. When this batch commits, they
	 * re-run with the real values.
	 * Lazily initialised for perf reasons
	 * @type {Set<Reaction> | null}
	 */
	stale_readers = null;

	/**
	 * `true` while this batch is flushing its effects and is provably terminal —
	 * solitary, with no pending async work and nothing scheduled. Such a batch
	 * unlinks before any other batch can observe its `previous` values, so
	 * recording them (one `Map` op per derived update) would be dead weight
	 */
	skip_previous = false;

	/** Number of times new work has extended this pending batch */
	restarts = 0;

	/** @type {Batch | null} */
	waiter = null;

	/** @type {{ batches: Set<Batch>, reactions: Map<Reaction, Batch> } | null} */
	waiting = null;

	#decrement_queued = false;

	constructor() {
		// link batch
		if (last_batch === null) {
			first_batch = last_batch = this;
		} else {
			last_batch.#next = this;
			this.#prev = last_batch;
		}

		last_batch = this;
	}

	#is_deferred() {
		if (this.waiting !== null) return true;
		if (this.is_fork) return true;
		if (this.#blocking_pending === null) return false;

		for (const effect of this.#blocking_pending.keys()) {
			var e = effect;
			var skipped = false;

			while (e.parent !== null) {
				if (this.#skipped_branches?.has(e)) {
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
		this.#skipped_branches ??= new Map();

		if (!this.#skipped_branches.has(effect)) {
			this.#skipped_branches.set(effect, { d: [], m: [] });
		}
	}

	/**
	 * Remove an effect from the #skipped_branches map and reschedule
	 * any tracked dirty/maybe_dirty child effects
	 * @param {Effect} effect
	 */
	unskip_effect(effect) {
		var tracked = this.#skipped_branches?.get(effect);
		if (tracked) {
			/** @type {Map<Effect, { d: Effect[], m: Effect[] }>} */ (this.#skipped_branches).delete(
				effect
			);

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

	/**
	 * If this batch was merged into another one, get the surviving batch
	 * @returns {Batch}
	 */
	resolved() {
		/** @type {Batch} */
		var batch = this;
		while (batch.merged_into !== null) batch = batch.merged_into;
		return batch;
	}

	/**
	 * Keep this batch separate from a sealed predecessor, coalescing it with any
	 * other work that is already waiting for that predecessor.
	 * @param {Batch} owner
	 * @param {Reaction | Value} signal
	 */
	#wait(owner, signal) {
		var waiter = owner.waiter;

		if (waiter !== null) {
			waiter = waiter.resolved();

			if (waiter !== this && waiter.linked) {
				this.#merge(waiter);
			}
		} else if (DEV) {
			w.await_starvation();
		}

		owner.waiter = this;
		var waiting = (this.waiting ??= { batches: new Set(), reactions: new Map() });
		waiting.batches.add(owner);
		if (Object.hasOwn(signal, 'deps')) waiting.reactions.set(signal, owner);
	}

	/**
	 * Hand reactions and deferred work to the batch waiting behind this one.
	 * Ownership changes synchronously so no intervening batch can bypass the waiter.
	 */
	#release_waiter() {
		var waiter = this.waiter;
		this.waiter = null;

		if (waiter === null || !(waiter = waiter.resolved()).linked) return;

		var waiting = /** @type {NonNullable<typeof waiter.waiting>} */ (waiter.waiting);
		waiting.batches.delete(this);

		for (const [reaction, owner] of waiting.reactions) {
			if (owner !== this) continue;

			waiting.reactions.delete(reaction);
			if ((reaction.f & DESTROYED) !== 0) continue;

			reaction.batch = waiter;

			if ((reaction.f & DERIVED) !== 0 && (reaction.f & DIRTY) === 0) {
				set_signal_status(reaction, MAYBE_DIRTY);
			} else if ((reaction.f & DERIVED) === 0) {
				var effect = /** @type {Effect} */ (reaction);

				if (waiter.#dirty_effects?.delete(effect)) {
					set_signal_status(effect, DIRTY);
					waiter.schedule(effect);
				} else if (waiter.#maybe_dirty_effects?.delete(effect)) {
					set_signal_status(effect, MAYBE_DIRTY);
					waiter.schedule(effect);
				}
			}
		}

		if (waiting.batches.size > 0) return;

		waiter.waiting = null;
		var released = /** @type {Batch} */ (waiter);

		queue_micro_task(() => {
			var batch = released.resolved();

			if (batch.linked && batch.waiting === null) {
				batch.flush();
			}
		});
	}

	/**
	 * Take ownership of a signal. Sources, deriveds and user/block/async effects can
	 * only ever belong to one live batch. If the signal is already claimed
	 * by another live batch, the two reactivity graphs overlap, which means the
	 * batches describe the same 'world', and they are merged into one. After too
	 * many restarts, new work waits behind the current batch instead.
	 * Template-level (render/managed) effects are exempt: they are leaves, so
	 * independent batches can share them without their graphs being entangled.
	 * Forks are also exempt - they are speculative and live in their own world.
	 * @param {Reaction | Value} signal
	 * @returns {boolean} Whether the signal must wait for a sealed batch
	 */
	claim(signal) {
		// already claimed by this batch — nothing below could change anything
		if (signal.batch === this) return false;

		if (!async_mode_flag || this.is_fork) return false;

		var is_source = !Object.hasOwn(signal, 'deps');

		if (!is_source && (signal.f & (DERIVED | ASYNC | BLOCK_EFFECT | USER_EFFECT)) === 0) {
			return false;
		}

		// template expression deriveds are leaves — they don't entangle
		if ((signal.f & TEMPLATE_EXPRESSION) !== 0) return false;

		var owner = signal.batch && signal.batch.resolved();

		if (this.is_eager) {
			// eager version bumps don't entangle — but an effect that belongs to
			// another live batch's world, and which we are about to run in ours,
			// must afterwards be re-established in the owner's world
			if (
				!is_source &&
				(signal.f & DERIVED) === 0 &&
				owner !== null &&
				owner !== this &&
				owner.linked &&
				!owner.is_fork
			) {
				// Not putting this into #dirty_effects to prevent infinite loops
				(owner.#reestablish_effects ??= new Set()).add(/** @type {Effect} */ (signal));
			}

			return false;
		}

		if (owner !== null && owner !== this && owner.linked && !owner.is_fork) {
			if (owner.waiting !== null) {
				this.#merge(owner);
				signal.batch = this;
				return false;
			}

			if (owner.restarts >= MAX_ENTANGLED_RESTARTS) {
				this.#wait(owner, signal);
				return true;
			}

			var restarts = owner.restarts + (owner.#is_deferred() ? 1 : 0);
			this.#merge(owner);
			this.restarts = Math.max(this.restarts, restarts);
		}

		signal.batch = this;
		return false;
	}

	/**
	 * @param {Effect} effect
	 * @param {boolean} [ran]
	 */
	record_effect(effect, ran = false) {
		if ((effect.f & (ASYNC | BLOCK_EFFECT)) === 0) return;

		if (this.is_fork) {
			(this.fork_effects ??= new Map()).set(effect, effect_versions.get(effect) ?? 0);
		} else if (ran) {
			effect_versions.set(effect, effect_version++);
		}
	}

	claim_fork_effects() {
		if (this.fork_effects === null) return;

		for (const [effect, version] of this.fork_effects) {
			if ((effect.f & DESTROYED) !== 0 || version !== (effect_versions.get(effect) ?? 0)) {
				this.#dirty_effects?.delete(effect);
				this.#maybe_dirty_effects?.delete(effect);
			}
		}

		for (const [effect, version] of this.fork_effects) {
			if ((effect.f & DESTROYED) !== 0) continue;

			if (version !== (effect_versions.get(effect) ?? 0)) {
				var owner = effect.batch && effect.batch.resolved();

				if (owner !== null && owner !== this && owner.linked && !owner.is_fork) {
					this.claim(effect);
				}
			} else {
				this.claim(effect);
			}
		}

		this.fork_effects = null;
	}

	/**
	 * Absorb another batch into this one — their reactivity graphs overlap,
	 * so they describe a single 'world'. All state is transferred, and stale
	 * references to `other` are forwarded to `this` via `merged_into`
	 * @param {Batch} other
	 */
	#merge(other) {
		var other_is_older = other.id < this.id;

		// for signals touched by both batches, keep the oldest `previous`
		// (the value from before either batch touched it)...
		for (const [source, previous] of other.previous) {
			if (other_is_older || !this.previous.has(source)) {
				this.previous.set(source, previous);
			}
		}

		// ...and the newest current value
		for (const [source, value] of other.current) {
			if (!other_is_older || !this.current.has(source)) {
				this.current.set(source, value);
			}
		}

		if (other.async_deriveds !== null) {
			this.async_deriveds ??= new Map();

			for (const [effect, d] of other.async_deriveds) {
				var existing = this.async_deriveds.get(effect);

				if (existing !== undefined) {
					if (d.id > existing.id) {
						existing.reject(OBSOLETE);
						this.async_deriveds.set(effect, d);
					} else {
						d.reject(OBSOLETE);
					}
				} else {
					this.async_deriveds.set(effect, d);
				}
			}
			other.async_deriveds = null;
		}

		this.#pending += other.#pending;
		other.#pending = 0;

		if (other.#blocking_pending !== null) {
			this.#blocking_pending ??= new Map();

			for (const [effect, count] of other.#blocking_pending) {
				this.#blocking_pending.set(effect, (this.#blocking_pending.get(effect) ?? 0) + count);
			}
			other.#blocking_pending = null;
		}

		this.transfer_effects(other.#dirty_effects, other.#maybe_dirty_effects);
		other.#dirty_effects = null;
		other.#maybe_dirty_effects = null;

		this.#reestablish_effects = transfer_set(this.#reestablish_effects, other.#reestablish_effects);
		other.#reestablish_effects = null;

		if (other.#skipped_branches !== null) {
			this.#skipped_branches ??= new Map();

			for (const [effect, tracked] of other.#skipped_branches) {
				var skipped = this.#skipped_branches.get(effect);
				if (skipped) {
					skipped.d.push(...tracked.d);
					skipped.m.push(...tracked.m);
				} else {
					this.#skipped_branches.set(effect, tracked);
				}
			}
			other.#skipped_branches = null;
		}

		// commit/discard callbacks stay bound to the batch they were registered
		// under — consumers (branch managers etc) key their state by batch
		if (other.#commit_callbacks !== null) {
			this.#commit_callbacks ??= new Set();

			for (const fn of other.#commit_callbacks) {
				this.#commit_callbacks.add(() => fn(other));
			}
			other.#commit_callbacks = null;
		}

		if (other.#discard_callbacks !== null) {
			this.#discard_callbacks ??= new Set();

			for (const fn of other.#discard_callbacks) {
				this.#discard_callbacks.add(() => fn(other));
			}
			other.#discard_callbacks = null;
		}

		for (const effect of other.#scheduled) {
			this.#scheduled.push(effect);
		}
		other.#scheduled = [];

		this.stale_readers = transfer_set(this.stale_readers, other.stale_readers);
		other.stale_readers = null;

		if (other.waiting !== null) {
			this.waiting ??= { batches: new Set(), reactions: new Map() };

			for (const owner of other.waiting.batches) {
				this.waiting.batches.add(owner);
				owner.waiter = this;
			}

			for (const [reaction, owner] of other.waiting.reactions) {
				this.waiting.reactions.set(reaction, owner);
			}
			other.waiting = null;
		}

		this.restarts = Math.max(this.restarts, other.restarts);

		// `other`'s settled() promise resolves when this batch settles
		if (other.#deferred !== null) {
			const d = other.#deferred;
			this.settled().then(d.resolve, d.reject);
		}

		other.merged_into = this;
		other.#unlink();

		// if we're mid-flush, the active overlay was holding back `other`'s values —
		// they are part of this batch's world now, so recompute the overrides
		if (active_batch !== null && active_batch.values !== null && active_batch.resolved() === this) {
			this.apply();
		}

		other.values = null;
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
		this.#started = true;

		if (this.waiting !== null) return;

		// this batch may be re-processed (e.g. when effects are scheduled during
		// its effect-flush phase), in which case async work could still be
		// discovered during the upcoming traversal — record `previous` values again
		this.skip_previous = false;

		if (DEV) {
			// track all the values that were updated during this flush,
			// so that they can be reset afterwards
			for (const value of this.current.keys()) {
				source_stacks.add(value);
			}
		}

		if (this.#reestablish_effects !== null) {
			var reestablish_effects = this.#reestablish_effects;
			this.#reestablish_effects = null;

			for (const e of reestablish_effects) {
				this.#dirty_effects?.delete(e);
				this.#maybe_dirty_effects?.delete(e);
				set_signal_status(e, DIRTY);
				this.schedule(e);
			}
		}

		// We always reschedule previously-deferred effects, not just when
		// #is_deferred() is true, because traversing the tree could make
		// an if block that contains the last blocking pending effect falsy,
		// causing the block to no longer be deferred.
		if (this.#dirty_effects !== null) {
			for (const e of this.#dirty_effects) {
				this.#maybe_dirty_effects?.delete(e);
				set_signal_status(e, DIRTY);
				this.schedule(e);
			}
		}

		if (this.#maybe_dirty_effects !== null) {
			for (const e of this.#maybe_dirty_effects) {
				set_signal_status(e, MAYBE_DIRTY);
				this.schedule(e);
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

			if (this.#skipped_branches !== null) {
				for (const [e, t] of this.#skipped_branches) {
					reset_branch(e, t);
				}
			}

			if (updates.length > 0) {
				/** @type {Batch} */ (/** @type {unknown} */ (current_batch)).#process();
			}

			return;
		}

		// clear effects. Those that are still needed will be rescheduled through unskipping the skipped branches.
		this.#dirty_effects = null;
		this.#maybe_dirty_effects = null;

		// append/remove branches
		if (this.#commit_callbacks !== null) {
			for (const fn of this.#commit_callbacks) fn(this);
			this.#commit_callbacks = null;
		}

		// while flushing effects, a solitary batch with no pending async work and
		// nothing scheduled is guaranteed to unlink at the end of this function,
		// before any other batch could observe its `previous` values — recording
		// them for derived updates would be pure overhead
		this.skip_previous =
			this.#pending === 0 &&
			this.#scheduled.length === 0 &&
			first_batch === this &&
			last_batch === this;

		previous_batch = this;
		flush_queued_effects(render_effects);
		flush_queued_effects(effects);
		previous_batch = null;

		this.#deferred?.resolve();

		var next_batch = /** @type {Batch | null} */ (/** @type {unknown} */ (current_batch));

		if (this.#pending === 0 && (this.#scheduled.length === 0 || next_batch !== null)) {
			this.#unlink();
			this.#release_waiter();

			if (async_mode_flag) {
				// now that this batch is committed, reactions that observed its
				// pre-write values (via the active overlay) re-run with the real ones
				this.#commit();
				this.values = null;

				// #commit may have scheduled stale readers into a new batch
				next_batch ??= /** @type {Batch | null} */ (/** @type {unknown} */ (current_batch));
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

			var skip =
				is_skippable_branch ||
				(flags & INERT) !== 0 ||
				this.#skipped_branches?.has(effect) === true;

			if (!skip && effect.fn !== null) {
				if (is_branch) {
					effect.f ^= CLEAN;
				} else if ((flags & EFFECT) !== 0) {
					effects.push(effect);
				} else if (async_mode_flag && (flags & (RENDER_EFFECT | MANAGED_EFFECT)) !== 0) {
					render_effects.push(effect);
				} else {
					var dirty = is_dirty(effect);

					if (dirty) {
						if ((flags & BLOCK_EFFECT) !== 0) {
							(this.#maybe_dirty_effects ??= new Set()).add(effect);
						}
						update_effect(effect);
					} else if ((flags & MAYBE_DIRTY) !== 0) {
						this.record_effect(effect);
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
			}
		}
	}

	/**
	 * @param {Effect[]} effects
	 */
	#defer_effects(effects) {
		if (effects.length === 0) return;

		this.#dirty_effects ??= new Set();
		this.#maybe_dirty_effects ??= new Set();

		for (var i = 0; i < effects.length; i += 1) {
			defer_effect(effects[i], this.#dirty_effects, this.#maybe_dirty_effects);
		}
	}

	/**
	 * Note a value's pre-write state, so that other (non-overlapping) batches
	 * can keep operating against the world as it was before this batch's writes
	 * @param {Value} source
	 */
	record_previous(source) {
		if (this.skip_previous) return;

		if (source.v !== UNINITIALIZED && !this.previous.has(source)) {
			this.previous.set(source, source.v);
		}
	}

	/**
	 * Associate a change to a given source with the current
	 * batch, noting its previous and current values
	 * @param {Value} source
	 * @param {any} value
	 */
	capture(source, value) {
		this.record_previous(source);

		// Don't save errors in the active overlay, or they won't be thrown in `runtime.js#get`
		if ((source.f & ERROR_VALUE) === 0) {
			this.current.set(source, value);
			(active_batch ?? (this.is_fork ? this : null))?.values?.set(source, [value, null]);
		}

		if (!this.is_fork) {
			source.v = value;
		}
	}

	activate() {
		current_batch = this.resolved();
	}

	deactivate() {
		current_batch = null;
		active_batch = null;
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
			active_batch = null;

			old_values.clear();

			if (DEV) {
				for (const source of source_stacks) {
					source.updated = null;
				}
			}
		}
	}

	discard() {
		this.fork_effects = null;
		this.values = null;

		if (this.#discard_callbacks !== null) {
			for (const fn of this.#discard_callbacks) fn(this);
			this.#discard_callbacks = null;
		}

		if (this.async_deriveds !== null) {
			for (const deferred of this.async_deriveds.values()) {
				deferred.reject(OBSOLETE);
			}
		}

		var was_linked = this.linked;
		this.#unlink();
		if (was_linked) this.#release_waiter();
		this.#deferred?.resolve();
	}

	#commit() {
		/** @type {Map<Batch, Effect[]> | null} */
		var forks = null;

		// A real-world run supersedes the same effect's speculative validation.
		// Once that run commits, revalidate each affected fork against the latest
		// real state, while keeping the fork's own writes isolated.
		for (var fork = first_batch; fork !== null; fork = fork.#next) {
			if (!fork.is_fork || fork.fork_effects === null) continue;

			if (fork.id < this.id) {
				for (const signal of this.current.keys()) {
					fork.current.delete(signal);
					fork.previous.delete(signal);
					fork.values?.delete(signal);
				}
			}

			if (fork.current.size === 0) {
				fork.discard();
				continue;
			}

			for (const [effect, version] of fork.fork_effects) {
				if (
					version === (effect_versions.get(effect) ?? 0) ||
					(effect.f & (DESTROYED | INERT)) !== 0
				) {
					continue;
				}

				var owner = effect.batch && effect.batch.resolved();
				if (owner !== this) continue;

				fork.schedule(effect);
				var effects = (forks ??= new Map()).get(fork);
				if (effects === undefined) forks.set(fork, [effect]);
				else effects.push(effect);
			}
		}

		if (forks !== null) {
			for (const [fork, effects] of forks) {
				queue_micro_task(() => {
					if (!fork.linked) return;
					// TODO this can overfire. Ideally we could bump the version of the sources, then find the connection between the scheduled effects
					// and those sources, only mark the path along them as (maybe)dirty, and then execute. That way they don't leave a trace behind
					// and don't overfire. But it's probably a lot more tedious code for little gain in edge cases.
					for (const effect of effects) set_signal_status(effect, DIRTY);
					fork.flush();
				});
			}
		}

		if (this.stale_readers === null) return;

		var readers = this.stale_readers;
		this.stale_readers = null;

		var batch = Batch.ensure();

		for (const reader of readers) {
			var flags = reader.f;

			if ((flags & (DESTROYED | INERT | DIRTY)) !== 0) continue;

			set_signal_status(reader, DIRTY);

			if ((flags & DERIVED) !== 0) {
				// invalidate anything that depends on the derived
				mark_reactions(/** @type {Derived} */ (reader), MAYBE_DIRTY, null);
			} else {
				batch.schedule(/** @type {Effect} */ (reader));
			}
		}
	}

	/**
	 * @param {boolean} blocking
	 * @param {Effect} effect
	 */
	increment(blocking, effect) {
		var batch = this.resolved();

		batch.#pending += 1;

		if (blocking) {
			batch.#blocking_pending ??= new Map();

			let blocking_pending_count = batch.#blocking_pending.get(effect) ?? 0;
			batch.#blocking_pending.set(effect, blocking_pending_count + 1);
		}
	}

	/**
	 * @param {boolean} blocking
	 * @param {Effect} effect
	 */
	decrement(blocking, effect) {
		var batch = this.resolved();

		batch.#pending -= 1;

		if (blocking && batch.#blocking_pending !== null) {
			let blocking_pending_count = batch.#blocking_pending.get(effect) ?? 0;

			if (blocking_pending_count === 1) {
				batch.#blocking_pending.delete(effect);
			} else {
				batch.#blocking_pending.set(effect, blocking_pending_count - 1);
			}
		}

		if (batch.#decrement_queued) return;
		batch.#decrement_queued = true;

		queue_micro_task(() => {
			batch.#decrement_queued = false;

			if (batch.linked) {
				batch.flush();
			}
		});
	}

	/**
	 * @param {Set<Effect> | null} dirty_effects
	 * @param {Set<Effect> | null} maybe_dirty_effects
	 */
	transfer_effects(dirty_effects, maybe_dirty_effects) {
		var batch = this.resolved();
		batch.#dirty_effects = transfer_set(batch.#dirty_effects, dirty_effects);
		batch.#maybe_dirty_effects = transfer_set(batch.#maybe_dirty_effects, maybe_dirty_effects);
	}

	/** @param {(batch: Batch) => void} fn */
	oncommit(fn) {
		(this.#commit_callbacks ??= new Set()).add(fn);
	}

	/** @param {(batch: Batch) => void} fn */
	ondiscard(fn) {
		(this.#discard_callbacks ??= new Set()).add(fn);
	}

	settled() {
		var batch = this.resolved();
		return (batch.#deferred ??= deferred()).promise;
	}

	static ensure() {
		if (current_batch === null) {
			const batch = (current_batch = new Batch());

			if (!is_processing && !is_flushing_sync) {
				queue_micro_task(() => {
					if (!batch.#started) {
						batch.flush();
					}
				});
			}
		}

		return current_batch;
	}

	apply() {
		var batch = this.resolved();
		active_batch = batch;

		if (!async_mode_flag || (!batch.is_fork && batch.#prev === null && batch.#next === null)) {
			batch.values = null;
			return;
		}

		if (batch.is_fork) {
			batch.values ??= new Map();
			return;
		}

		/** @type {Map<Value, [any, Batch | null]>} */
		var values = (batch.values = new Map());

		// undo changes belonging to other live batches — aside from our own
		// changes, we should only see values that have been committed. Overlapping
		// batches are merged unless one is waiting behind a sealed predecessor
		for (let other = first_batch; other !== null; other = other.#next) {
			if (other === batch || other.is_fork) continue;

			for (const [source, previous] of other.previous) {
				if (!values.has(source)) {
					values.set(source, [previous, other]);
				}
			}
		}

		// our own writes take precedence over everything else
		for (const [source, value] of batch.current) {
			values.set(source, [value, null]);
		}
	}

	/**
	 *
	 * @param {Effect} effect
	 */
	schedule(effect) {
		last_scheduled_effect = effect;

		if (this.is_fork && (effect.f & (ASYNC | BLOCK_EFFECT)) !== 0) {
			this.fork_effects?.delete(effect);
		}

		if (this.claim(effect)) {
			this.#dirty_effects ??= new Set();
			this.#maybe_dirty_effects ??= new Set();
			defer_effect(effect, this.#dirty_effects, this.#maybe_dirty_effects);
			return;
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

		var prev = this.#prev;
		var next = this.#next;

		if (prev === null) {
			first_batch = next;
		} else {
			prev.#next = next;
		}

		if (next === null) {
			last_batch = prev;
		} else {
			next.#prev = prev;
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
 * @param {Effect} effect
 * @returns {void}
 */
export function schedule_effect(effect) {
	/** @type {Batch} */ (current_batch).schedule(effect);
}

/**
 * If the given reaction was claimed by (i.e. belongs to the world of) a live
 * batch other than the current one, returns that batch. Such reactions are
 * 'frozen' while operating in another batch's context — they must not be
 * recomputed, nor have their status reset, as the owning batch relies on it
 * @param {Reaction} reaction
 * @returns {Batch | null}
 */
export function claimed_by_other(reaction) {
	var owner = reaction.batch;
	if (owner === null) return null;

	owner = owner.resolved();
	reaction.batch = owner;

	return owner.linked && owner !== active_batch?.resolved() ? owner : null;
}

/** @type {Source<number>[]} */
let eager_versions = [];

function eager_flush() {
	flushSync(() => {
		Batch.ensure().is_eager = true;

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

	teardown(() => {
		if (parent.f & DESTROYING) version_map.delete(parent);
	});

	get(version);

	eager_effect(() => {
		if (initial) {
			// the first time this runs, we create an eager effect
			// that will run eagerly whenever the expression changes
			var previous_active_batch = active_batch;

			try {
				active_batch = null;
				value = fn();
			} finally {
				active_batch = previous_active_batch;
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
 * When a fork is committed, deriveds affected by its writes must recompute with
 * the now-committed values, and affected effects must be checked. Async and
 * block effects that were validated inside the fork are skipped, and eager
 * effects are collected so that `$state.eager(...)` expressions update immediately
 * @param {Value} value
 * @param {Batch} batch
 * @param {Map<Value, number>} marked
 * @param {number} status
 */
function mark_committed_reactions(value, batch, marked, status) {
	var previous_status = marked.get(value);
	if (previous_status === DIRTY || previous_status === status) return;
	marked.set(value, status);

	var reactions = value.reactions;
	if (reactions === null) return;

	for (const reaction of reactions) {
		var flags = reaction.f;

		if ((flags & EAGER_EFFECT) !== 0) {
			if ((flags & DIRTY) === 0) {
				set_signal_status(reaction, status);
			}
			eager_effects.add(/** @type {Effect} */ (reaction));
		} else if ((flags & DERIVED) !== 0) {
			batch.claim(reaction);

			if ((flags & DIRTY) === 0) {
				set_signal_status(reaction, status);
			}

			mark_committed_reactions(/** @type {Derived} */ (reaction), batch, marked, MAYBE_DIRTY);
		} else if ((flags & (ASYNC | BLOCK_EFFECT)) !== 0) {
			var effect = /** @type {Effect} */ (reaction);
			var owner = effect.batch && effect.batch.resolved();

			var fork_version = batch.fork_effects?.get(effect);
			var validated =
				fork_version !== undefined && fork_version === (effect_versions.get(effect) ?? 0);
			var stale =
				batch.stale_readers?.has(effect) === true || owner?.stale_readers?.has(effect) === true;

			if (fork_version === undefined || stale) {
				if ((reaction.f & DIRTY) === 0) {
					set_signal_status(reaction, status);
				}

				batch.schedule(effect);
			} else if (
				!validated &&
				owner !== null &&
				owner !== batch &&
				owner.linked &&
				!owner.is_fork
			) {
				batch.claim(effect);
			}
		} else if ((flags & DIRTY) === 0) {
			set_signal_status(reaction, status);
			batch.schedule(/** @type {Effect} */ (reaction));
		}
	}
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

	var batch = Batch.ensure();
	batch.is_fork = true;
	batch.apply();

	var committed = false;
	var discarded = false;
	var settled = batch.settled();

	flushSync(fn);

	return {
		commit: async () => {
			// Differentiate between a fork that was implicitly discarded (because all its updates are obsolete,
			// in which case we don't want to error), and a fork that was explicitly discarded (called fork.discard(),
			// in which case we do want to error).
			if (discarded) {
				e.fork_discarded();
			}

			if (committed || !batch.linked) {
				await settled;
				return;
			}

			committed = true;

			batch.is_fork = false;
			batch.values = null;

			// Write the fork's changes through and invalidate affected deriveds
			// and template/user effects, so they recompute with the committed
			// values. Async and block effects already ran inside the fork with
			// these exact values, so they are left alone. Claiming the deriveds
			// entangles us with any overlapping pending batches
			batch.activate();

			/** @type {Map<Value, number>} */
			var marked = new Map();

			for (var source of batch.current.keys()) {
				mark_committed_reactions(source, batch, marked, DIRTY);
			}

			// Marking can entangle the fork with newer work and replace values in
			// `current`, so only write through once the final world is known.
			for (var [signal, value] of batch.current) {
				signal.v = value;
				signal.wv = increment_write_version();
			}

			// Effects retained from the speculative world now belong to the real
			// batch, so subsequent overlapping work can entangle with it.
			batch.claim_fork_effects();

			batch.deactivate();

			// trigger any `$state.eager(...)` expressions with the new state.
			// eager effects don't get scheduled like other effects — marking
			// collected them, but nothing flushes them during a fork commit
			flush_eager_effects();

			batch.flush();
			await settled;
		},
		discard: () => {
			discarded = true;

			// cause any MAYBE_DIRTY deriveds to update
			// if they depend on things thath changed
			// inside the discarded fork
			for (var source of batch.current.keys()) {
				source.wv = increment_write_version();
			}

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
	active_batch = null;
}

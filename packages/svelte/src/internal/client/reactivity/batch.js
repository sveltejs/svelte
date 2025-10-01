/** @import { Derived, Effect, Source, Value } from '#client' */
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
	DERIVED
} from '#client/constants';
import { async_mode_flag } from '../../flags/index.js';
import { deferred, define_property, noop } from '../../shared/utils.js';
import {
	active_effect,
	is_dirty,
	is_updating_effect,
	set_is_updating_effect,
	set_signal_status,
	update_effect
} from '../runtime.js';
import * as e from '../errors.js';
import { flush_tasks, queue_micro_task } from '../dom/task.js';
import { DEV } from 'esm-env';
import { invoke_error_boundary } from '../error-handling.js';
import { old_values } from './sources.js';
import { unlink_effect } from './effects.js';

/** @type {Set<Batch>} */
const batches = new Set();

/** @type {Batch | null} */
export let current_batch = null;

/**
 * This is needed to avoid overwriting inputs in non-async mode
 * TODO 6.0 remove this, as non-async mode will go away
 * @type {Batch | null}
 */
export let previous_batch = null;

/**
 * When time travelling, we re-evaluate deriveds based on the temporary
 * values of their dependencies rather than their actual values, and cache
 * the results in this map rather than on the deriveds themselves
 * @type {Map<Derived, any> | null}
 */
export let batch_deriveds = null;

/** @type {Set<() => void>} */
export let effect_pending_updates = new Set();

/** @type {Effect[]} */
let queued_root_effects = [];

/** @type {Effect | null} */
let last_scheduled_effect = null;

let is_flushing = false;
export let is_flushing_sync = false;

export class Batch {
	/**
	 * The current values of any sources that are updated in this batch
	 * They keys of this map are identical to `this.#previous`
	 * @type {Map<Source, any>}
	 */
	current = new Map();

	/**
	 * The values of any sources that are updated in this batch _before_ those updates took place.
	 * They keys of this map are identical to `this.#current`
	 * @type {Map<Source, any>}
	 */
	#previous = new Map();

	/**
	 * When the batch is committed (and the DOM is updated), we need to remove old branches
	 * and append new ones by calling the functions added inside (if/each/key/etc) blocks
	 * @type {Set<() => void>}
	 */
	#callbacks = new Set();

	/**
	 * The number of async effects that are currently in flight
	 */
	#pending = 0;

	/**
	 * A deferred that resolves when the batch is committed, used with `settled()`
	 * TODO replace with Promise.withResolvers once supported widely enough
	 * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
	 */
	#deferred = null;

	/**
	 * Async effects inside a newly-created `<svelte:boundary>`
	 * — these do not prevent the batch from committing
	 * @type {Effect[]}
	 */
	#boundary_async_effects = [];

	/**
	 * Template effects and `$effect.pre` effects, which run when
	 * a batch is committed
	 * @type {Effect[]}
	 */
	#render_effects = [];

	/**
	 * The same as `#render_effects`, but for `$effect` (which runs after)
	 * @type {Effect[]}
	 */
	#effects = [];

	/**
	 * Block effects, which may need to re-run on subsequent flushes
	 * in order to update internal sources (e.g. each block items)
	 * @type {Effect[]}
	 */
	#block_effects = [];

	/**
	 * Deferred effects (which run after async work has completed) that are DIRTY
	 * @type {Effect[]}
	 */
	#dirty_effects = [];

	/**
	 * Deferred effects that are MAYBE_DIRTY
	 * @type {Effect[]}
	 */
	#maybe_dirty_effects = [];

	/**
	 * A set of branches that still exist, but will be destroyed when this batch
	 * is committed — we skip over these during `process`
	 * @type {Set<Effect>}
	 */
	skipped_effects = new Set();

	/**
	 *
	 * @param {Effect[]} root_effects
	 */
	process(root_effects) {
		queued_root_effects = [];

		previous_batch = null;

		var revert = Batch.apply(this);

		for (const root of root_effects) {
			this.#traverse_effect_tree(root);
		}

		// if we didn't start any new async work, and no async work
		// is outstanding from a previous flush, commit
		if (this.#pending === 0) {
			this.#commit();

			var render_effects = this.#render_effects;
			var effects = this.#effects;

			this.#render_effects = [];
			this.#effects = [];
			this.#block_effects = [];

			// If sources are written to, then work needs to happen in a separate batch, else prior sources would be mixed with
			// newly updated sources, which could lead to infinite loops when effects run over and over again.
			previous_batch = this;
			current_batch = null;

			flush_queued_effects(render_effects);
			flush_queued_effects(effects);

			this.#deferred?.resolve();
		} else {
			this.#defer_effects(this.#render_effects);
			this.#defer_effects(this.#effects);
			this.#defer_effects(this.#block_effects);
		}

		revert();

		for (const effect of this.#boundary_async_effects) {
			update_effect(effect);
		}

		this.#boundary_async_effects = [];
	}

	/**
	 * Traverse the effect tree, executing effects or stashing
	 * them for later execution as appropriate
	 * @param {Effect} root
	 */
	#traverse_effect_tree(root) {
		root.f ^= CLEAN;

		var effect = root.first;

		while (effect !== null) {
			var flags = effect.f;
			var is_branch = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
			var is_skippable_branch = is_branch && (flags & CLEAN) !== 0;

			var skip = is_skippable_branch || (flags & INERT) !== 0 || this.skipped_effects.has(effect);

			if (!skip && effect.fn !== null) {
				if (is_branch) {
					effect.f ^= CLEAN;
				} else if ((flags & EFFECT) !== 0) {
					this.#effects.push(effect);
				} else if (async_mode_flag && (flags & RENDER_EFFECT) !== 0) {
					this.#render_effects.push(effect);
				} else if ((flags & CLEAN) === 0) {
					if ((flags & ASYNC) !== 0 && effect.b?.is_pending()) {
						this.#boundary_async_effects.push(effect);
					} else if (is_dirty(effect)) {
						if ((effect.f & BLOCK_EFFECT) !== 0) this.#block_effects.push(effect);
						update_effect(effect);
					}
				}

				var child = effect.first;

				if (child !== null) {
					effect = child;
					continue;
				}
			}

			var parent = effect.parent;
			effect = effect.next;

			while (effect === null && parent !== null) {
				effect = parent.next;
				parent = parent.parent;
			}
		}
	}

	/**
	 * @param {Effect[]} effects
	 */
	#defer_effects(effects) {
		for (const e of effects) {
			const target = (e.f & DIRTY) !== 0 ? this.#dirty_effects : this.#maybe_dirty_effects;
			target.push(e);

			// mark as clean so they get scheduled if they depend on pending async state
			set_signal_status(e, CLEAN);
		}

		effects.length = 0;
	}

	/**
	 * Associate a change to a given source with the current
	 * batch, noting its previous and current values
	 * @param {Source} source
	 * @param {any} value
	 */
	capture(source, value) {
		if (!this.#previous.has(source)) {
			this.#previous.set(source, value);
		}

		this.current.set(source, source.v);
	}

	activate() {
		current_batch = this;
	}

	deactivate() {
		current_batch = null;
		previous_batch = null;

		for (const update of effect_pending_updates) {
			effect_pending_updates.delete(update);
			update();

			if (current_batch !== null) {
				// only do one at a time
				break;
			}
		}
	}

	flush() {
		if (queued_root_effects.length > 0) {
			this.activate();
			flush_effects();

			if (current_batch !== null && current_batch !== this) {
				// this can happen if a new batch was created during `flush_effects()`
				return;
			}
		} else if (this.#pending === 0) {
			this.#commit();
		}

		this.deactivate();
	}

	/**
	 * Append and remove branches to/from the DOM
	 */
	#commit() {
		for (const fn of this.#callbacks) {
			fn();
		}

		this.#callbacks.clear();

		// If there are other pending batches, they now need to be 'rebased' —
		// in other words, we re-run block/async effects with the newly
		// committed state, unless the batch in question has a more
		// recent value for a given source
		if (batches.size > 1) {
			this.#previous.clear();

			let is_earlier = true;

			for (const batch of batches) {
				if (batch === this) {
					is_earlier = false;
					continue;
				}

				for (const [source, value] of this.current) {
					if (batch.current.has(source)) {
						if (is_earlier) {
							// bring the value up to date
							batch.current.set(source, value);
						} else {
							// later batch has more recent value,
							// no need to re-run these effects
							continue;
						}
					}

					mark_effects(source);
				}

				if (queued_root_effects.length > 0) {
					current_batch = batch;
					const revert = Batch.apply(batch);

					for (const root of queued_root_effects) {
						batch.#traverse_effect_tree(root);
					}

					queued_root_effects = [];
					revert();
				}
			}

			current_batch = null;
		}

		batches.delete(this);
	}

	increment() {
		this.#pending += 1;
	}

	decrement() {
		this.#pending -= 1;

		if (this.#pending === 0) {
			for (const e of this.#dirty_effects) {
				set_signal_status(e, DIRTY);
				schedule_effect(e);
			}

			for (const e of this.#maybe_dirty_effects) {
				set_signal_status(e, MAYBE_DIRTY);
				schedule_effect(e);
			}

			this.flush();
		} else {
			this.deactivate();
		}
	}

	/** @param {() => void} fn */
	add_callback(fn) {
		this.#callbacks.add(fn);
	}

	settled() {
		return (this.#deferred ??= deferred()).promise;
	}

	static ensure() {
		if (current_batch === null) {
			const batch = (current_batch = new Batch());
			batches.add(current_batch);

			if (!is_flushing_sync) {
				Batch.enqueue(() => {
					if (current_batch !== batch) {
						// a flushSync happened in the meantime
						return;
					}

					batch.flush();
				});
			}
		}

		return current_batch;
	}

	/** @param {() => void} task */
	static enqueue(task) {
		queue_micro_task(task);
	}

	/**
	 * @param {Batch} current_batch
	 */
	static apply(current_batch) {
		if (!async_mode_flag || batches.size === 1) {
			return noop;
		}

		// if there are multiple batches, we are 'time travelling' —
		// we need to undo the changes belonging to any batch
		// other than the current one

		/** @type {Map<Source, { v: unknown, wv: number }>} */
		var current_values = new Map();
		batch_deriveds = new Map();

		for (const [source, current] of current_batch.current) {
			current_values.set(source, { v: source.v, wv: source.wv });
			source.v = current;
		}

		for (const batch of batches) {
			if (batch === current_batch) continue;

			for (const [source, previous] of batch.#previous) {
				if (!current_values.has(source)) {
					current_values.set(source, { v: source.v, wv: source.wv });
					source.v = previous;
				}
			}
		}

		return () => {
			for (const [source, { v, wv }] of current_values) {
				// reset the source to the current value (unless
				// it got a newer value as a result of effects running)
				if (source.wv <= wv) {
					source.v = v;
				}
			}

			batch_deriveds = null;
		};
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
	if (async_mode_flag && active_effect !== null) {
		// We disallow this because it creates super-hard to reason about stack trace and because it's generally a bad idea
		e.flush_sync_in_effect();
	}

	var was_flushing_sync = is_flushing_sync;
	is_flushing_sync = true;

	try {
		var result;

		if (fn) {
			if (current_batch !== null) {
				flush_effects();
			}

			result = fn();
		}

		while (true) {
			flush_tasks();

			if (queued_root_effects.length === 0) {
				current_batch?.flush();

				// we need to check again, in case we just updated an `$effect.pending()`
				if (queued_root_effects.length === 0) {
					// this would be reset in `flush_effects()` but since we are early returning here,
					// we need to reset it here as well in case the first time there's 0 queued root effects
					last_scheduled_effect = null;

					return /** @type {T} */ (result);
				}
			}

			flush_effects();
		}
	} finally {
		is_flushing_sync = was_flushing_sync;
	}
}

function flush_effects() {
	var was_updating_effect = is_updating_effect;
	is_flushing = true;

	try {
		var flush_count = 0;
		set_is_updating_effect(true);

		while (queued_root_effects.length > 0) {
			var batch = Batch.ensure();

			if (flush_count++ > 1000) {
				if (DEV) {
					var updates = new Map();

					for (const source of batch.current.keys()) {
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
						// eslint-disable-next-line no-console
						console.error(update.error);
					}
				}

				infinite_loop_guard();
			}

			batch.process(queued_root_effects);
			old_values.clear();
		}
	} finally {
		is_flushing = false;
		set_is_updating_effect(was_updating_effect);

		last_scheduled_effect = null;
	}
}

function infinite_loop_guard() {
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

/** @type {Effect[] | null} */
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
			eager_block_effects = [];

			update_effect(effect);

			// Effects with no dependencies or teardown do not get added to the effect tree.
			// Deferred effects (e.g. `$effect(...)`) _are_ added to the tree because we
			// don't know if we need to keep them until they are executed. Doing the check
			// here (rather than in `update_effect`) allows us to skip the work for
			// immediate effects.
			if (effect.deps === null && effect.first === null && effect.nodes_start === null) {
				// if there's no teardown or abort controller we completely unlink
				// the effect from the graph
				if (effect.teardown === null && effect.ac === null) {
					// remove this effect from the graph
					unlink_effect(effect);
				} else {
					// keep the effect in the graph, but free up some memory
					effect.fn = null;
				}
			}

			// If update_effect() has a flushSync() in it, we may have flushed another flush_queued_effects(),
			// which already handled this logic and did set eager_block_effects to null.
			if (eager_block_effects?.length > 0) {
				// TODO this feels incorrect! it gets the tests passing
				old_values.clear();

				for (const e of eager_block_effects) {
					update_effect(e);
				}

				eager_block_effects = [];
			}
		}
	}

	eager_block_effects = null;
}

/**
 * This is similar to `mark_reactions`, but it only marks async/block effects
 * so that these can re-run after another batch has been committed
 * @param {Value} value
 */
function mark_effects(value) {
	if (value.reactions !== null) {
		for (const reaction of value.reactions) {
			const flags = reaction.f;

			if ((flags & DERIVED) !== 0) {
				mark_effects(/** @type {Derived} */ (reaction));
			} else if ((flags & (ASYNC | BLOCK_EFFECT)) !== 0) {
				set_signal_status(reaction, DIRTY);
				schedule_effect(/** @type {Effect} */ (reaction));
			}
		}
	}
}

/**
 * @param {Effect} signal
 * @returns {void}
 */
export function schedule_effect(signal) {
	var effect = (last_scheduled_effect = signal);

	while (effect.parent !== null) {
		effect = effect.parent;
		var flags = effect.f;

		// if the effect is being scheduled because a parent (each/await/etc) block
		// updated an internal source, bail out or we'll cause a second flush
		if (is_flushing && effect === active_effect && (flags & BLOCK_EFFECT) !== 0) {
			return;
		}

		if ((flags & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
			if ((flags & CLEAN) === 0) return;
			effect.f ^= CLEAN;
		}
	}

	queued_root_effects.push(effect);
}

/**
 * Forcibly remove all current batches, to prevent cross-talk between tests
 */
export function clear() {
	batches.clear();
}

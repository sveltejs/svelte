/** @import { Derived, Effect, Source } from '#client' */
import {
	BLOCK_EFFECT,
	BRANCH_EFFECT,
	CLEAN,
	DESTROYED,
	DIRTY,
	EFFECT,
	EFFECT_ASYNC,
	INERT,
	RENDER_EFFECT,
	ROOT_EFFECT
} from '#client/constants';
import { async_mode_flag } from '../../flags/index.js';
import { deferred, define_property } from '../../shared/utils.js';
import { get_pending_boundary } from '../dom/blocks/boundary.js';
import {
	active_effect,
	check_dirtiness,
	dev_effect_stack,
	is_updating_effect,
	queued_root_effects,
	set_is_updating_effect,
	set_queued_root_effects,
	set_signal_status,
	update_effect
} from '../runtime.js';
import * as e from '../errors.js';
import { flush_tasks } from '../dom/task.js';
import { DEV } from 'esm-env';
import { invoke_error_boundary } from '../error-handling.js';
import { old_values } from './sources.js';
import { unlink_effect } from './effects.js';

/** @type {Set<Batch>} */
const batches = new Set();

/** @type {Batch | null} */
export let current_batch = null;

/** @type {Map<Derived, any> | null} */
export let batch_deriveds = null;

/** @type {Effect | null} */
let last_scheduled_effect = null;

/** TODO handy for debugging, but we should probably eventually delete it */
let uid = 1;

export class Batch {
	id = uid++;

	/**
	 * The current values of any sources that are updated in this batch
	 * They keys of this map are identical to `this.#previous`
	 * @type {Map<Source, any>}
	 */
	#current = new Map();

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

	/** @type {Effect[]} */
	async_effects = [];

	/** @type {Effect[]} */
	boundary_async_effects = [];

	/** @type {Effect[]} */
	render_effects = [];

	/** @type {Effect[]} */
	effects = [];

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
		set_queued_root_effects([]);

		/** @type {Map<Source, { v: unknown, wv: number }> | null} */
		var current_values = null;
		var time_travelling = false;

		for (const batch of batches) {
			if (batch !== this) {
				time_travelling = true;
				break;
			}
		}

		if (time_travelling) {
			current_values = new Map();
			batch_deriveds = new Map();

			for (const [source, current] of this.#current) {
				current_values.set(source, { v: source.v, wv: source.wv });
				source.v = current;
			}

			for (const batch of batches) {
				if (batch === this) continue;

				for (const [source, previous] of batch.#previous) {
					if (!current_values.has(source)) {
						current_values.set(source, { v: source.v, wv: source.wv });
						source.v = previous;
					}
				}
			}
		}

		for (const root of root_effects) {
			process_effects(this, root);
		}

		if (this.async_effects.length === 0 && this.#pending === 0) {
			var merged = false;

			// if there are older batches with overlapping
			// state, we can't commit this batch. instead,
			// we merge it into the older batches
			for (const batch of batches) {
				if (batch === this) break;

				for (const [source] of batch.#current) {
					if (this.#current.has(source)) {
						merged = true;

						for (const [source, value] of this.#current) {
							batch.#current.set(source, value);
						}

						for (const e of this.render_effects) {
							set_signal_status(e, CLEAN);
							// TODO use sets instead of arrays
							if (!batch.render_effects.includes(e)) {
								batch.render_effects.push(e);
							}
						}

						for (const e of this.effects) {
							set_signal_status(e, CLEAN);
							// TODO use sets instead of arrays
							if (!batch.effects.includes(e)) {
								batch.effects.push(e);
							}
						}

						for (const e of this.skipped_effects) {
							batch.skipped_effects.add(e);
						}

						for (const fn of this.#callbacks) {
							batch.#callbacks.add(fn);
						}

						break;
					}
				}
			}

			if (!merged) {
				var render_effects = this.render_effects;
				var effects = this.effects;

				this.render_effects = [];
				this.effects = [];

				this.#commit();

				flush_queued_effects(render_effects);
				flush_queued_effects(effects);

				this.#deferred?.resolve();
			}
		} else {
			for (const e of this.render_effects) set_signal_status(e, CLEAN);
			for (const e of this.effects) set_signal_status(e, CLEAN);
		}

		if (current_values) {
			for (const [source, { v, wv }] of current_values) {
				// reset the source to the current value (unless
				// it got a newer value as a result of effects running)
				if (source.wv <= wv) {
					source.v = v;
				}
			}

			batch_deriveds = null;
		}

		for (const effect of this.async_effects) {
			update_effect(effect);
		}

		for (const effect of this.boundary_async_effects) {
			update_effect(effect);
		}

		this.async_effects = [];
		this.boundary_async_effects = [];
	}

	/**
	 * @param {Source} source
	 * @param {any} value
	 */
	capture(source, value) {
		if (!this.#previous.has(source)) {
			this.#previous.set(source, value);
		}

		this.#current.set(source, source.v);
	}

	activate() {
		current_batch = this;
	}

	deactivate() {
		current_batch = null;
	}

	flush() {
		if (queued_root_effects.length > 0) {
			this.flush_effects();
		} else {
			this.#commit();
		}

		if (current_batch !== this) {
			// this can happen if a `flushSync` occurred during `this.flush_effects()`,
			// which is permitted in legacy mode despite being a terrible idea
			return;
		}

		if (this.#pending === 0) {
			batches.delete(this);
		}

		current_batch = null;
	}

	flush_effects() {
		var was_updating_effect = is_updating_effect;

		try {
			var flush_count = 0;
			set_is_updating_effect(true);

			while (queued_root_effects.length > 0) {
				if (flush_count++ > 1000) {
					infinite_loop_guard();
				}

				this.process(queued_root_effects);

				old_values.clear();
			}
		} finally {
			set_is_updating_effect(was_updating_effect);

			last_scheduled_effect = null;
			if (DEV) {
				dev_effect_stack.length = 0;
			}
		}
	}

	#commit() {
		for (const fn of this.#callbacks) {
			fn();
		}

		this.#callbacks.clear();
	}

	increment() {
		this.#pending += 1;
	}

	decrement() {
		this.#pending -= 1;

		if (this.#pending === 0) {
			for (const e of this.render_effects) {
				set_signal_status(e, DIRTY);
				schedule_effect(e);
			}

			for (const e of this.effects) {
				set_signal_status(e, DIRTY);
				schedule_effect(e);
			}

			this.render_effects = [];
			this.effects = [];

			this.flush();
		}
	}

	/** @param {() => void} fn */
	add_callback(fn) {
		this.#callbacks.add(fn);
	}

	/** @param {Effect} effect */
	skips(effect) {
		/** @type {Effect | null} */
		var e = effect;

		while (e !== null) {
			if (this.skipped_effects.has(e)) {
				return true;
			}

			e = e.parent;
		}

		return false;
	}

	settled() {
		return (this.#deferred ??= deferred()).promise;
	}

	static ensure() {
		if (current_batch === null) {
			const batch = (current_batch = new Batch());
			batches.add(current_batch);

			queueMicrotask(() => {
				if (current_batch !== batch) {
					// a flushSync happened in the meantime
					return;
				}

				batch.flush();
			});
		}

		return current_batch;
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
		e.flush_sync_in_effect();
	}

	var result;

	const batch = Batch.ensure();

	if (fn) {
		batch.flush_effects();

		result = fn();
	}

	while (true) {
		flush_tasks();

		if (queued_root_effects.length === 0) {
			if (batch === current_batch) {
				batch.flush();
			}

			// this would be reset in `batch.flush_effects()` but since we are early returning here,
			// we need to reset it here as well in case the first time there's 0 queued root effects
			last_scheduled_effect = null;

			if (DEV) {
				dev_effect_stack.length = 0;
			}

			return /** @type {T} */ (result);
		}

		batch.flush_effects();
	}
}

function log_effect_stack() {
	// eslint-disable-next-line no-console
	console.error(
		'Last ten effects were: ',
		dev_effect_stack.slice(-10).map((d) => d.fn)
	);
	dev_effect_stack.length = 0;
}

function infinite_loop_guard() {
	try {
		e.effect_update_depth_exceeded();
	} catch (error) {
		if (DEV) {
			// stack is garbage, ignore. Instead add a console.error message.
			define_property(error, 'stack', {
				value: ''
			});
		}
		// Try and handle the error so it can be caught at a boundary, that's
		// if there's an effect available from when it was last scheduled
		if (last_scheduled_effect !== null) {
			if (DEV) {
				try {
					invoke_error_boundary(error, last_scheduled_effect);
				} catch (e) {
					// Only log the effect stack if the error is re-thrown
					log_effect_stack();
					throw e;
				}
			} else {
				invoke_error_boundary(error, last_scheduled_effect);
			}
		} else {
			if (DEV) {
				log_effect_stack();
			}
			throw error;
		}
	}
}

/**
 * @param {Array<Effect>} effects
 * @returns {void}
 */
export function flush_queued_effects(effects) {
	var length = effects.length;
	if (length === 0) return;

	for (var i = 0; i < length; i++) {
		var effect = effects[i];

		if ((effect.f & (DESTROYED | INERT)) === 0) {
			if (check_dirtiness(effect)) {
				update_effect(effect);

				// Effects with no dependencies or teardown do not get added to the effect tree.
				// Deferred effects (e.g. `$effect(...)`) _are_ added to the tree because we
				// don't know if we need to keep them until they are executed. Doing the check
				// here (rather than in `update_effect`) allows us to skip the work for
				// immediate effects.
				if (effect.deps === null && effect.first === null && effect.nodes_start === null) {
					if (effect.teardown === null) {
						// remove this effect from the graph
						unlink_effect(effect);
					} else {
						// keep the effect in the graph, but free up some memory
						effect.fn = null;
					}
				}
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

		if ((flags & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
			if ((flags & CLEAN) === 0) return;
			effect.f ^= CLEAN;
		}
	}

	queued_root_effects.push(effect);
}

/**
 *
 * This function both runs render effects and collects user effects in topological order
 * from the starting effect passed in. Effects will be collected when they match the filtered
 * bitwise flag passed in only. The collected effects array will be populated with all the user
 * effects to be flushed.
 *
 * @param {Batch} batch
 * @param {Effect} root
 */
export function process_effects(batch, root) {
	root.f ^= CLEAN;

	var effect = root.first;

	while (effect !== null) {
		var flags = effect.f;
		var is_branch = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
		var is_skippable_branch = is_branch && (flags & CLEAN) !== 0;

		var skip = is_skippable_branch || (flags & INERT) !== 0 || batch.skipped_effects.has(effect);

		if (!skip && effect.fn !== null) {
			if ((flags & EFFECT_ASYNC) !== 0) {
				const boundary = effect.b;

				if (check_dirtiness(effect)) {
					var effects = boundary?.pending ? batch.boundary_async_effects : batch.async_effects;
					effects.push(effect);
				}
			} else if ((flags & BLOCK_EFFECT) !== 0) {
				if (check_dirtiness(effect)) {
					update_effect(effect);
				}
			} else if (is_branch) {
				effect.f ^= CLEAN;
			} else if ((flags & RENDER_EFFECT) !== 0) {
				// we need to branch here because in legacy mode we run render effects
				// before running block effects
				if (async_mode_flag) {
					batch.render_effects.push(effect);
				} else {
					if (check_dirtiness(effect)) {
						update_effect(effect);
					}
				}
			} else if ((flags & EFFECT) !== 0) {
				batch.effects.push(effect);
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

export function suspend() {
	var boundary = get_pending_boundary();
	var batch = /** @type {Batch} */ (current_batch);
	var pending = boundary.pending;

	boundary.update_pending_count(1);
	if (!pending) batch.increment();

	return function unsuspend() {
		boundary.update_pending_count(-1);
		if (!pending) batch.decrement();
	};
}

/**
 * Forcibly remove all current batches, to prevent cross-talk between tests
 */
export function clear() {
	batches.clear();
}

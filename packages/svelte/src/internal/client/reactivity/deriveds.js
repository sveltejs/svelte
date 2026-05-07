/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */
/** @import { Batch } from './batch.js'; */
/** @import { Boundary } from '../dom/blocks/boundary.js'; */
import { DEV } from 'esm-env';
import {
	ERROR_VALUE,
	DERIVED,
	DIRTY,
	EFFECT_PRESERVED,
	STALE_REACTION,
	ASYNC,
	WAS_MARKED,
	DESTROYED,
	CLEAN,
	REACTION_RAN,
	INERT
} from '#client/constants';
import {
	active_reaction,
	active_effect,
	update_reaction,
	increment_write_version,
	set_active_effect,
	push_reaction_value,
	is_destroying_effect,
	update_effect,
	remove_reactions,
	skipped_deps,
	new_deps
} from '../runtime.js';
import { equals, safe_equals } from './equality.js';
import * as e from '../errors.js';
import * as w from '../warnings.js';
import {
	async_effect,
	destroy_effect,
	destroy_effect_children,
	effect_tracking,
	teardown
} from './effects.js';
import { eager_effects, internal_set, set_eager_effects, source } from './sources.js';
import { get_error } from '../../shared/dev.js';
import { async_mode_flag, tracing_mode_flag } from '../../flags/index.js';
import { component_context } from '../context.js';
import { UNINITIALIZED } from '../../../constants.js';
import { batch_values, current_batch, previous_batch } from './batch.js';
import { increment_pending, unset_context } from './async.js';
import { deferred, includes, noop } from '../../shared/utils.js';
import { set_signal_status, update_derived_status } from './status.js';

/**
 * This allows us to track 'reactivity loss' that occurs when signals
 * are read after a non-context-restoring `await`. Dev-only
 * @type {{ effect: Effect, effect_deps: Set<Value>, warned: boolean } | null}
 */
export let reactivity_loss_tracker = null;

/** @param {{ effect: Effect, effect_deps: Set<Value>, warned: boolean } | null} v */
export function set_reactivity_loss_tracker(v) {
	reactivity_loss_tracker = v;
}

export const recent_async_deriveds = new Set();

/**
 * @template V
 * @param {() => V} fn
 * @returns {Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived(fn) {
	var flags = DERIVED | DIRTY;

	if (active_effect !== null) {
		// Since deriveds are evaluated lazily, any effects created inside them are
		// created too late to ensure that the parent effect is added to the tree
		active_effect.f |= EFFECT_PRESERVED;
	}

	/** @type {Derived<V>} */
	const signal = {
		ctx: component_context,
		deps: null,
		effects: null,
		equals,
		f: flags,
		fn,
		reactions: null,
		rv: 0,
		v: /** @type {V} */ (UNINITIALIZED),
		wv: 0,
		parent: active_effect,
		ac: null
	};

	if (DEV && tracing_mode_flag) {
		signal.created = get_error('created at');
	}

	return signal;
}

const OBSOLETE = {};

/**
 * @template V
 * @param {() => V | Promise<V>} fn
 * @param {string} [label]
 * @param {string} [location] If provided, print a warning if the value is not read immediately after update
 * @returns {Promise<Source<V>>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function async_derived(fn, label, location) {
	let parent = /** @type {Effect | null} */ (active_effect);

	if (parent === null) {
		e.async_derived_orphan();
	}

	var promise = /** @type {Promise<V>} */ (/** @type {unknown} */ (undefined));
	var signal = source(/** @type {V} */ (UNINITIALIZED));

	if (DEV) signal.label = label ?? fn.toString();

	// only suspend in async deriveds created on initialisation
	var should_suspend = !active_reaction;

	/** @type {Map<Batch, ReturnType<typeof deferred<V>>>} */
	var deferreds = new Map();

	async_effect(() => {
		var effect = /** @type {Effect} */ (active_effect);

		if (DEV) {
			reactivity_loss_tracker = { effect, effect_deps: new Set(), warned: false };
		}

		/** @type {ReturnType<typeof deferred<V>>} */
		var d = deferred();
		promise = d.promise;

		try {
			// If this code is changed at some point, make sure to still access the then property
			// of fn() to read any signals it might access, so that we track them as dependencies.
			// We call `unset_context` to undo any `save` calls that happen inside `fn()`
			Promise.resolve(fn())
				.then(d.resolve, (e) => {
					// if the promise was rejected by the user, via `getAbortSignal`, then
					// wait for a subsequent resolution instead of flushing the batch
					if (e !== STALE_REACTION) d.reject(e);
				})
				.finally(unset_context);
		} catch (error) {
			d.reject(error);
			unset_context();
		}

		if (DEV) {
			if (reactivity_loss_tracker) {
				// Reused deps from previous run (indices 0 to skipped_deps-1)
				// We deliberately only track direct dependencies of the async expression to encourage
				// dependencies being directly visible at the point of the expression
				if (effect.deps !== null) {
					for (let i = 0; i < skipped_deps; i += 1) {
						reactivity_loss_tracker.effect_deps.add(effect.deps[i]);
					}
				}

				// New deps discovered this run
				if (new_deps !== null) {
					for (let i = 0; i < new_deps.length; i += 1) {
						reactivity_loss_tracker.effect_deps.add(new_deps[i]);
					}
				}
			}

			reactivity_loss_tracker = null;
		}

		var batch = /** @type {Batch} */ (current_batch);

		if (should_suspend) {
			// we only increment the batch's pending state for updates, not creation, otherwise
			// we will decrement to zero before the work that depends on this promise (e.g. a
			// template effect) has initialized, causing the batch to resolve prematurely
			if ((effect.f & REACTION_RAN) !== 0) {
				var decrement_pending = increment_pending();
			}

			if (/** @type {Boundary} */ (parent.b).is_rendered()) {
				deferreds.get(batch)?.reject(OBSOLETE);
			} else {
				// While the boundary is still showing pending, a new run supersedes all older in-flight runs
				// for this async expression. Cancel eagerly so resolution cannot commit stale values.
				for (const d of deferreds.values()) {
					d.reject(OBSOLETE);
				}
			}

			deferreds.set(batch, d);
		}

		/**
		 * @param {any} value
		 * @param {unknown} error
		 */
		const handler = (value, error = undefined) => {
			if (DEV) {
				reactivity_loss_tracker = null;
			}

			decrement_pending?.();
			deferreds.delete(batch);

			if (error === OBSOLETE) return;

			batch.activate();

			if (error) {
				signal.f |= ERROR_VALUE;

				// @ts-expect-error the error is the wrong type, but we don't care
				internal_set(signal, error);
			} else {
				if ((signal.f & ERROR_VALUE) !== 0) {
					signal.f ^= ERROR_VALUE;
				}

				internal_set(signal, value);

				// All prior async derived runs are now stale
				for (const [b, d] of deferreds) {
					if (b.id < batch.id) {
						// Don't delete + resolve directly, instead only do that once
						// the current batch commits. This way we avoid tearing when
						// `b` is rendering through the early resolve while `batch` is
						// still pending.
						batch.unblocked.add(effect);
						batch.oncommit(() => d.resolve(value));
					}
				}

				if (DEV && location !== undefined) {
					recent_async_deriveds.add(signal);

					setTimeout(() => {
						if (recent_async_deriveds.has(signal) && (effect.f & DESTROYED) === 0) {
							w.await_waterfall(/** @type {string} */ (signal.label), location);
							recent_async_deriveds.delete(signal);
						}
					});
				}
			}

			batch.deactivate();
		};

		d.promise.then(handler, (e) => handler(null, e || 'unknown'));
	});

	teardown(() => {
		for (const d of deferreds.values()) {
			d.reject(OBSOLETE);
		}
	});

	if (DEV) {
		// add a flag that lets this be printed as a derived
		// when using `$inspect.trace()`
		signal.f |= ASYNC;
	}

	return new Promise((fulfil) => {
		/** @param {Promise<V>} p */
		function next(p) {
			function go() {
				if (p === promise) {
					fulfil(signal);
				} else {
					// if the effect re-runs before the initial promise
					// resolves, delay resolution until we have a value
					next(promise);
				}
			}

			p.then(go, go);
		}

		next(promise);
	});
}

/**
 * @template V
 * @param {() => V} fn
 * @returns {Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function user_derived(fn) {
	const d = derived(fn);

	if (!async_mode_flag) push_reaction_value(d);

	return d;
}

/**
 * @template V
 * @param {() => V} fn
 * @returns {Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived_safe_equal(fn) {
	const signal = derived(fn);
	signal.equals = safe_equals;
	return signal;
}

/**
 * @param {Derived} derived
 * @returns {void}
 */
export function destroy_derived_effects(derived) {
	var effects = derived.effects;

	if (effects !== null) {
		derived.effects = null;

		for (var i = 0; i < effects.length; i += 1) {
			destroy_effect(/** @type {Effect} */ (effects[i]));
		}
	}
}

/**
 * The currently updating deriveds, used to detect infinite recursion
 * in dev mode and provide a nicer error than 'too much recursion'
 * @type {Derived[]}
 */
let stack = [];

/**
 * @template T
 * @param {Derived} derived
 * @returns {T}
 */
export function execute_derived(derived) {
	var value;
	var prev_active_effect = active_effect;
	var parent = derived.parent;

	if (!is_destroying_effect && parent !== null && (parent.f & (DESTROYED | INERT)) !== 0) {
		w.derived_inert();

		return derived.v;
	}

	set_active_effect(parent);

	if (DEV) {
		let prev_eager_effects = eager_effects;
		set_eager_effects(new Set());
		try {
			if (includes.call(stack, derived)) {
				e.derived_references_self();
			}

			stack.push(derived);

			derived.f &= ~WAS_MARKED;
			destroy_derived_effects(derived);
			value = update_reaction(derived);
		} finally {
			set_active_effect(prev_active_effect);
			set_eager_effects(prev_eager_effects);
			stack.pop();
		}
	} else {
		try {
			derived.f &= ~WAS_MARKED;
			destroy_derived_effects(derived);
			value = update_reaction(derived);
		} finally {
			set_active_effect(prev_active_effect);
		}
	}

	return value;
}

/**
 * @param {Derived} derived
 * @returns {void}
 */
export function update_derived(derived) {
	var value = execute_derived(derived);

	if (!derived.equals(value)) {
		derived.wv = increment_write_version();

		// in a fork, we don't update the underlying value, just `batch_values`.
		// the underlying value will be updated when the fork is committed.
		// otherwise, the next time we get here after a 'real world' state
		// change, `derived.equals` may incorrectly return `true`
		if (!current_batch?.is_fork || derived.deps === null) {
			if (current_batch !== null) {
				// We also write to previous_batch because if it exists, it is a sign that we're
				// currently in the process of flushing effects. These updates to deriveds may belong
				// to the previous batch, not the new one (which can already exist if an earlier
				// effect wrote to a source). This can cause bugs when running batch.#commit() later,
				// but not adding it to current_batch can, too, so we add it to both.
				// See https://github.com/sveltejs/svelte/pull/18117 for more details.
				current_batch.capture(derived, value, true);
				previous_batch?.capture(derived, value, true);
			} else {
				derived.v = value;
			}

			// deriveds without dependencies should never be recomputed
			if (derived.deps === null) {
				set_signal_status(derived, CLEAN);
				return;
			}
		}
	}

	// don't mark derived clean if we're reading it inside a
	// cleanup function, or it will cache a stale value
	if (is_destroying_effect) {
		return;
	}

	// During time traveling we don't want to reset the status so that
	// traversal of the graph in the other batches still happens
	if (batch_values !== null) {
		// only cache the value if we're in a tracking context, otherwise we won't
		// clear the cache in `mark_reactions` when dependencies are updated
		if (effect_tracking() || current_batch?.is_fork) {
			batch_values.set(derived, value);
		}
	} else {
		update_derived_status(derived);
	}
}

/**
 * @param {Derived} derived
 */
export function freeze_derived_effects(derived) {
	if (derived.effects === null) return;

	for (const e of derived.effects) {
		// if the effect has a teardown function or abort signal, call it
		if (e.teardown || e.ac) {
			e.teardown?.();
			e.ac?.abort(STALE_REACTION);

			// make it a noop so it doesn't get called again if the derived
			// is unfrozen. we don't set it to `null`, because the existence
			// of a teardown function is what determines whether the
			// effect runs again during unfreezing
			e.teardown = noop;
			e.ac = null;

			remove_reactions(e, 0);
			destroy_effect_children(e);
		}
	}
}

/**
 * @param {Derived} derived
 */
export function unfreeze_derived_effects(derived) {
	if (derived.effects === null) return;

	for (const e of derived.effects) {
		// if the effect was previously frozen — indicated by the presence
		// of a teardown function — unfreeze it
		if (e.teardown) {
			update_effect(e);
		}
	}
}

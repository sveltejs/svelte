/** @import { Derived, Effect, Source } from '#client' */
/** @import { Batch } from './batch.js'; */
/** @import { Boundary } from '../dom/blocks/boundary.js'; */
import { DEV } from 'esm-env';
import {
	ERROR_VALUE,
	DERIVED,
	EFFECT_PRESERVED,
	STALE_REACTION,
	ASYNC,
	WAS_MARKED,
	DESTROYED,
	REACTION_RAN
} from '#client/constants';
import {
	active_reaction,
	active_effect,
	update_reaction,
	set_active_effect,
	push_reaction_value,
	update_effect,
	remove_reactions,
	write_version
} from '../runtime.js';
import { equals, safe_equals } from './equality.js';
import * as e from '../errors.js';
import * as w from '../warnings.js';
import { async_effect, destroy_effect, destroy_effect_children, teardown } from './effects.js';
import { eager_effects, internal_set, set_eager_effects, source } from './sources.js';
import { get_error } from '../../shared/dev.js';
import { async_mode_flag, tracing_mode_flag } from '../../flags/index.js';
import { component_context } from '../context.js';
import { UNINITIALIZED } from '../../../constants.js';
import { batch_wvs, current_batch, get_wv, set_cv } from './batch.js';
import { increment_pending, unset_context } from './async.js';
import { deferred, noop } from '../../shared/utils.js';

/**
 * This allows us to track 'reactivity loss' that occurs when signals
 * are read after a non-context-restoring `await`. Dev-only
 * @type {{ effect: Effect, warned: boolean } | null}
 */
export let reactivity_loss_tracker = null;

/** @param {{ effect: Effect, warned: boolean } | null} v */
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
	var parent_derived =
		active_reaction !== null && (active_reaction.f & DERIVED) !== 0
			? /** @type {Derived} */ (active_reaction)
			: null;

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
		f: DERIVED,
		fn,
		reactions: null,
		cv: -1,
		rv: 0,
		wv: 0,
		v: /** @type {V} */ (UNINITIALIZED),
		parent: parent_derived ?? active_effect,
		ac: null
	};

	if (DEV && tracing_mode_flag) {
		signal.created = get_error('created at');
	}

	return signal;
}

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

	if (DEV) signal.label = label ?? '{await ...}';

	// only suspend in async deriveds created on initialisation
	var should_suspend = !active_reaction;

	/** @type {Map<Batch, ReturnType<typeof deferred<V>>>} */
	var deferreds = new Map();

	async_effect(() => {
		if (DEV) {
			reactivity_loss_tracker = {
				effect: /** @type {Effect} */ (active_effect),
				warned: false
			};
		}

		var effect = /** @type {Effect} */ (active_effect);

		/** @type {ReturnType<typeof deferred<V>>} */
		var d = deferred();
		promise = d.promise;

		try {
			// If this code is changed at some point, make sure to still access the then property
			// of fn() to read any signals it might access, so that we track them as dependencies.
			// We call `unset_context` to undo any `save` calls that happen inside `fn()`
			Promise.resolve(fn()).then(d.resolve, d.reject).finally(unset_context);
		} catch (error) {
			d.reject(error);
			unset_context();
		}

		if (DEV) {
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
				deferreds.get(batch)?.reject(STALE_REACTION);
				deferreds.delete(batch); // delete to ensure correct order in Map iteration below
			} else {
				// While the boundary is still showing pending, a new run supersedes all older in-flight runs
				// for this async expression. Cancel eagerly so resolution cannot commit stale values.
				for (const d of deferreds.values()) {
					d.reject(STALE_REACTION);
				}
				deferreds.clear();
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

			if (decrement_pending) {
				// don't trigger an update if we're only here because
				// the promise was superseded before it could resolve
				var skip = error === STALE_REACTION;
				decrement_pending(skip);
			}

			if (error === STALE_REACTION || (effect.f & DESTROYED) !== 0) {
				return;
			}

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
					deferreds.delete(b);
					if (b === batch) break;
					d.reject(STALE_REACTION);
				}

				if (DEV && location !== undefined) {
					recent_async_deriveds.add(signal);

					setTimeout(() => {
						if (recent_async_deriveds.has(signal)) {
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
			d.reject(STALE_REACTION);
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
			/** @param {unknown} v */
			function go(v) {
				if (p === promise || v !== STALE_REACTION) {
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
 * @type {Derived[] | null}
 */
export let derived_stack = null;

/**
 * @param {Derived} derived
 * @returns {Effect | null}
 */
function get_derived_parent_effect(derived) {
	var parent = derived.parent;
	while (parent !== null) {
		if ((parent.f & DERIVED) === 0) {
			// The original parent effect might've been destroyed but the derived
			// is used elsewhere now - do not return the destroyed effect in that case
			return (parent.f & DESTROYED) === 0 ? /** @type {Effect} */ (parent) : null;
		}
		parent = parent.parent;
	}
	return null;
}

/**
 * @template T
 * @param {Derived} derived
 * @returns {T}
 */
export function execute_derived(derived) {
	var value;
	var prev_active_effect = active_effect;

	set_active_effect(get_derived_parent_effect(derived));

	derived_stack ??= [];

	if (DEV) {
		// TODO don't we need eager effects in prod too?
		let prev_eager_effects = eager_effects;
		set_eager_effects(new Set());

		try {
			derived_stack.push(derived);
			derived.f &= ~WAS_MARKED;
			destroy_derived_effects(derived);
			value = update_reaction(derived);
		} finally {
			set_active_effect(prev_active_effect);
			set_eager_effects(prev_eager_effects);
			derived_stack.pop();
		}
	} else {
		try {
			derived_stack.push(derived);
			derived.f &= ~WAS_MARKED;
			destroy_derived_effects(derived);
			value = update_reaction(derived);
		} finally {
			set_active_effect(prev_active_effect);
			derived_stack.pop();
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

	set_cv(derived, derived.deps === null ? Infinity : Math.max(...derived.deps.map(get_wv)));

	if (!derived.equals(value)) {
		batch_wvs?.set(derived, write_version);

		if (current_batch !== null) {
			current_batch.capture_derived(derived, value);
		} else {
			derived.v = value;
			derived.wv = write_version;
		}
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

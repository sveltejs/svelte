import { DEV } from 'esm-env';
import {
	current_component_context,
	current_consumer,
	current_effect,
	execute_effect,
	flush_local_render_effects,
	schedule_effect
} from '../runtime.js';
import { default_equals, safe_equal } from './equality.js';
import { remove } from '../reconciler.js';
import {
	DIRTY,
	MANAGED,
	RENDER_EFFECT,
	EFFECT,
	PRE_EFFECT,
	DERIVED,
	UNOWNED,
	CLEAN,
	UNINITIALIZED,
	INERT,
	ROOT_EFFECT,
	DESTROYED
} from '../constants.js';

/**
 * @template V
 * @param {import('../types.js').SignalFlags} flags
 * @param {V} value
 */
function create_computation_signal(flags, value) {
	/** @type {import('../types.js').Computation<V>} */
	const signal = {
		c: null,
		d: null,
		e: null,
		f: flags,
		l: 0,
		i: null,
		r: null,
		v: value,
		w: 0,
		x: null,
		y: null,
		parent: current_effect
	};

	if (DEV) {
		// @ts-expect-error
		signal.inspect = new Set();
	}

	return signal;
}

/**
 * @param {import('../types.js').Computation} target_signal
 * @param {import('../types.js').Computation} ref_signal
 * @returns {void}
 */
export function push_reference(target_signal, ref_signal) {
	const references = target_signal.r;
	if (references === null) {
		target_signal.r = [ref_signal];
	} else {
		references.push(ref_signal);
	}
}

/**
 * @param {import('../types.js').EffectType} type
 * @param {(() => void | (() => void))} fn
 * @param {boolean} sync
 * @param {boolean} schedule
 * @returns {import('../types.js').EffectSignal}
 */
function internal_create_effect(type, fn, sync, schedule) {
	const signal = create_computation_signal(type | DIRTY, null);
	signal.i = fn;
	signal.x = current_component_context;
	if (current_effect !== null) {
		signal.l = current_effect.l + 1;
		push_reference(current_effect, signal);
	}
	if (schedule) {
		schedule_effect(signal, sync);
	}
	return signal;
}

/**
 * @returns {boolean}
 */
export function effect_active() {
	return current_effect ? (current_effect.f & MANAGED) === 0 : false;
}

/**
 * Internal representation of `$effect(...)`
 * @param {() => void | (() => void)} fn
 * @returns {import('../types.js').EffectSignal}
 */
export function user_effect(fn) {
	if (current_effect === null) {
		throw new Error(
			'ERR_SVELTE_ORPHAN_EFFECT' +
				(DEV ? ': The Svelte $effect rune can only be used during component initialisation.' : '')
		);
	}

	const apply_component_effect_heuristics =
		current_effect.f & RENDER_EFFECT &&
		current_component_context !== null &&
		!current_component_context.m;

	const effect = internal_create_effect(EFFECT, fn, false, !apply_component_effect_heuristics);

	if (apply_component_effect_heuristics) {
		const context = /** @type {import('../types.js').ComponentContext} */ (
			current_component_context
		);
		(context.e ??= []).push(effect);
	}

	return effect;
}

/**
 * Internal representation of `$effect.root(...)`
 * @param {() => void | (() => void)} fn
 * @returns {() => void}
 */
export function user_root_effect(fn) {
	const effect = internal_create_effect(RENDER_EFFECT | ROOT_EFFECT, fn, true, true);
	return () => {
		destroy_effect(effect);
	};
}

/**
 * @param {() => void | (() => void)} fn
 * @returns {import('../types.js').EffectSignal}
 */
export function effect(fn) {
	return internal_create_effect(EFFECT, fn, false, true);
}

/**
 * @param {() => void | (() => void)} fn
 * @returns {import('../types.js').EffectSignal}
 */
export function managed_effect(fn) {
	return internal_create_effect(EFFECT | MANAGED, fn, false, true);
}

/**
 * @param {() => void | (() => void)} fn
 * @param {boolean} sync
 * @returns {import('../types.js').EffectSignal}
 */
export function managed_pre_effect(fn, sync) {
	return internal_create_effect(PRE_EFFECT | MANAGED, fn, sync, true);
}

/**
 * Internal representation of `$effect.pre(...)`
 * @param {() => void | (() => void)} fn
 * @returns {import('../types.js').EffectSignal}
 */
export function pre_effect(fn) {
	if (current_effect === null) {
		throw new Error(
			'ERR_SVELTE_ORPHAN_EFFECT' +
				(DEV
					? ': The Svelte $effect.pre rune can only be used during component initialisation.'
					: '')
		);
	}
	const sync = current_effect !== null && (current_effect.f & RENDER_EFFECT) !== 0;
	return internal_create_effect(
		PRE_EFFECT,
		() => {
			const val = fn();
			flush_local_render_effects();
			return val;
		},
		sync,
		true
	);
}

/**
 * This effect is used to ensure binding are kept in sync. We use a pre effect to ensure we run before the
 * bindings which are in later effects. However, we don't use a pre_effect directly as we don't want to flush anything.
 *
 * @param {() => void | (() => void)} fn
 * @returns {import('../types.js').EffectSignal}
 */
export function invalidate_effect(fn) {
	return internal_create_effect(PRE_EFFECT, fn, true, true);
}

/**
 * @param {() => void | (() => void)} fn
 * @param {boolean} managed
 * @param {boolean} sync
 * @returns {import('../types.js').EffectSignal}
 */
export function render_effect(fn, managed = false, sync = true) {
	let flags = RENDER_EFFECT;
	if (managed) {
		flags |= MANAGED;
	}
	return internal_create_effect(flags, /** @type {any} */ (fn), sync, true);
}

/**
 * @template V
 * @param {() => V} fn
 * @returns {import('../types.js').Computation<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived(fn) {
	const is_unowned = current_effect === null;
	const flags = is_unowned ? DERIVED | UNOWNED : DERIVED;
	const signal = /** @type {import('../types.js').Computation<V>} */ (
		create_computation_signal(flags | CLEAN, UNINITIALIZED)
	);
	signal.i = fn;
	signal.e = default_equals;
	if (current_consumer !== null) {
		push_reference(current_consumer, signal);
	}
	return signal;
}

/**
 * @template V
 * @param {() => V} fn
 * @returns {import('../types.js').Computation<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived_safe_equal(fn) {
	const signal = derived(fn);
	signal.e = safe_equal;
	return signal;
}

/**
 * @param {import('../types.js').Computation} effect
 * @param {() => void} done
 */
export function pause_effect(effect, done) {
	/** @type {import('../types.js').TransitionObject[]} */
	const transitions = [];

	pause_children(effect, transitions, true);

	let remaining = transitions.length;

	if (remaining > 0) {
		const check = () => {
			if (!--remaining) {
				destroy_effect(effect);
				done();
			}
		};

		for (const transition of transitions) {
			transition.to(0, check);
		}
	} else {
		destroy_effect(effect);
		done();
	}
}

/**
 * @param {import('../types.js').BlockEffect} effect
 * @param {import('../types.js').TransitionObject[]} transitions
 * @param {boolean} local
 */
function pause_children(effect, transitions, local) {
	if ((effect.f & INERT) !== 0) return;
	effect.f |= INERT;

	if ((effect.f & DERIVED) === 0 && typeof effect.v === 'function') {
		effect.v();
	}

	if (effect.out) {
		for (const transition of effect.out) {
			if (transition.global || local) {
				transitions.push(transition);
			}
		}
	}

	if (effect.r) {
		for (const child of effect.r) {
			pause_children(child, transitions, false);
		}
	}
}

/**
 * @param {import('../types.js').BlockEffect} effect TODO this isn't just block effects, it's deriveds etc too
 */
export function destroy_effect(effect) {
	if ((effect.f & DESTROYED) !== 0) return;
	effect.f |= DESTROYED;

	// TODO detach from parent effect

	// TODO distinguish between 'block effects' (?) which own their own DOM
	// and other render effects
	if (effect.dom) {
		// TODO skip already-detached DOM
		remove(effect.dom);
	}

	if (effect.r) {
		for (const child of effect.r) {
			destroy_effect(child);
		}
	}
}

/**
 * @param {import('../types.js').BlockEffect} effect
 */
export function resume_effect(effect) {
	resume_children(effect, true);
}

/**
 * @param {import('../types.js').BlockEffect} effect
 * @param {boolean} local
 */
function resume_children(effect, local) {
	if ((effect.f & DERIVED) === 0 && (effect.f & MANAGED) === 0) {
		execute_effect(/** @type {import('../types.js').EffectSignal} */ (effect));
	}

	if (effect.r) {
		for (const child of effect.r) {
			resume_children(child, false);
		}
	}

	effect.f ^= INERT;

	if (effect.in) {
		for (const transition of effect.in) {
			if (transition.global || local) {
				transition.to(1);
			}
		}
	}
}

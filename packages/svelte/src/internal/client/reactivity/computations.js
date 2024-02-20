import { DEV } from 'esm-env';
import {
	CLEAN,
	DERIVED,
	DIRTY,
	EFFECT,
	MANAGED,
	PRE_EFFECT,
	RENDER_EFFECT,
	UNINITIALIZED,
	UNOWNED,
	current_block,
	current_component_context,
	current_consumer,
	current_effect,
	destroy_signal,
	flush_local_render_effects,
	schedule_effect
} from '../runtime.js';
import { default_equals, safe_equal } from './equality.js';

/**
 * @template V
 * @param {import('../types.js').SignalFlags} flags
 * @param {V} value
 * @param {import('../types.js').Block | null} block
 * @returns {import('../types.js').ComputationSignal<V> | import('../types.js').ComputationSignal<V> & import('../types.js').SourceSignalDebug}
 */
function create_computation_signal(flags, value, block) {
	if (DEV) {
		return {
			// block
			b: block,
			// consumers
			c: null,
			// destroy
			d: null,
			// equals
			e: null,
			// flags
			f: flags,
			// init
			i: null,
			// level
			l: 0,
			// references
			r: null,
			// value
			v: value,
			// write version
			w: 0,
			// context: We can remove this if we get rid of beforeUpdate/afterUpdate
			x: null,
			// destroy
			y: null,
			// this is for DEV only
			inspect: new Set()
		};
	}

	return {
		// block
		b: block,
		// consumers
		c: null,
		// destroy
		d: null,
		// equals
		e: null,
		// flags
		f: flags,
		// level
		l: 0,
		// init
		i: null,
		// references
		r: null,
		// value
		v: value,
		// write version
		w: 0,
		// context: We can remove this if we get rid of beforeUpdate/afterUpdate
		x: null,
		// destroy
		y: null
	};
}

/**
 * @param {import('../types.js').ComputationSignal} target_signal
 * @param {import('../types.js').ComputationSignal} ref_signal
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
 * @param {(() => void | (() => void)) | ((b: import('../types.js').Block) => void | (() => void))} init
 * @param {boolean} sync
 * @param {null | import('../types.js').Block} block
 * @param {boolean} schedule
 * @returns {import('../types.js').EffectSignal}
 */
function internal_create_effect(type, init, sync, block, schedule) {
	const signal = create_computation_signal(type | DIRTY, null, block);
	signal.i = init;
	signal.x = current_component_context;
	if (current_effect !== null) {
		signal.l = current_effect.l + 1;
		if ((type & MANAGED) === 0) {
			push_reference(current_effect, signal);
		}
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
 * @param {() => void | (() => void)} init
 * @returns {import('../types.js').EffectSignal}
 */
export function user_effect(init) {
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
	const effect = internal_create_effect(
		EFFECT,
		init,
		false,
		current_block,
		!apply_component_effect_heuristics
	);
	if (apply_component_effect_heuristics) {
		const context = /** @type {import('../types.js').ComponentContext} */ (
			current_component_context
		);
		(context.e ??= []).push(effect);
	}
	return effect;
}

/**
 * @param {() => void | (() => void)} init
 * @returns {() => void}
 */
export function user_root_effect(init) {
	const effect = managed_render_effect(init);
	return () => {
		destroy_signal(effect);
	};
}

/**
 * @param {() => void | (() => void)} init
 * @returns {import('../types.js').EffectSignal}
 */
export function effect(init) {
	return internal_create_effect(EFFECT, init, false, current_block, true);
}

/**
 * @param {() => void | (() => void)} init
 * @returns {import('../types.js').EffectSignal}
 */
export function managed_effect(init) {
	return internal_create_effect(EFFECT | MANAGED, init, false, current_block, true);
}

/**
 * @param {() => void | (() => void)} init
 * @param {boolean} sync
 * @returns {import('../types.js').EffectSignal}
 */
export function managed_pre_effect(init, sync) {
	return internal_create_effect(PRE_EFFECT | MANAGED, init, sync, current_block, true);
}

/**
 * @param {() => void | (() => void)} init
 * @returns {import('../types.js').EffectSignal}
 */
export function pre_effect(init) {
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
			const val = init();
			flush_local_render_effects();
			return val;
		},
		sync,
		current_block,
		true
	);
}

/**
 * This effect is used to ensure binding are kept in sync. We use a pre effect to ensure we run before the
 * bindings which are in later effects. However, we don't use a pre_effect directly as we don't want to flush anything.
 *
 * @param {() => void | (() => void)} init
 * @returns {import('../types.js').EffectSignal}
 */
export function invalidate_effect(init) {
	return internal_create_effect(PRE_EFFECT, init, true, current_block, true);
}

/**
 * @template {import('../types.js').Block} B
 * @param {(block: B) => void | (() => void)} init
 * @param {any} block
 * @param {any} managed
 * @param {any} sync
 * @returns {import('../types.js').EffectSignal}
 */
export function render_effect(init, block = current_block, managed = false, sync = true) {
	let flags = RENDER_EFFECT;
	if (managed) {
		flags |= MANAGED;
	}
	return internal_create_effect(flags, /** @type {any} */ (init), sync, block, true);
}

/**
 * @template {import('../types.js').Block} B
 * @param {(block: B) => void | (() => void)} init
 * @param {any} block
 * @param {any} sync
 * @returns {import('../types.js').EffectSignal}
 */
export function managed_render_effect(init, block = current_block, sync = true) {
	const flags = RENDER_EFFECT | MANAGED;
	return internal_create_effect(flags, /** @type {any} */ (init), sync, block, true);
}

/**
 * @template V
 * @param {() => V} init
 * @returns {import('../types.js').ComputationSignal<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived(init) {
	const is_unowned = current_effect === null;
	const flags = is_unowned ? DERIVED | UNOWNED : DERIVED;
	const signal = /** @type {import('../types.js').ComputationSignal<V>} */ (
		create_computation_signal(flags | CLEAN, UNINITIALIZED, current_block)
	);
	signal.i = init;
	signal.e = default_equals;
	if (current_consumer !== null) {
		push_reference(current_consumer, signal);
	}
	return signal;
}

/**
 * @template V
 * @param {() => V} init
 * @returns {import('../types.js').ComputationSignal<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived_safe_equal(init) {
	const signal = derived(init);
	signal.e = safe_equal;
	return signal;
}

import { DEV } from 'esm-env';
import {
	DIRTY,
	EFFECT,
	MANAGED,
	PRE_EFFECT,
	RENDER_EFFECT,
	create_computation_signal,
	current_block,
	current_component_context,
	current_effect,
	destroy_signal,
	flush_local_render_effects,
	push_reference,
	schedule_effect
} from '../runtime.js';

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

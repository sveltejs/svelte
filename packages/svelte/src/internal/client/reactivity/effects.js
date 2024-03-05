import { DEV } from 'esm-env';
import {
	current_block,
	current_component_context,
	current_effect,
	destroy_signal,
	flush_local_render_effects,
	schedule_effect
} from '../runtime.js';
import { DIRTY, MANAGED, RENDER_EFFECT, EFFECT, PRE_EFFECT } from '../constants.js';

/**
 * @param {import('#client').Reaction} target_signal
 * @param {import('#client').Reaction} ref_signal
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
 * @param {import('./types.js').EffectType} type
 * @param {(() => void | (() => void)) | ((b: import('#client').Block) => void | (() => void))} fn
 * @param {boolean} sync
 * @param {null | import('#client').Block} block
 * @param {boolean} schedule
 * @returns {import('#client').Effect}
 */
function create_effect(type, fn, sync, block, schedule) {
	/** @type {import('#client').Effect} */
	const signal = {
		b: block,
		c: null,
		d: null,
		e: null,
		f: type | DIRTY,
		l: 0,
		i: fn,
		r: null,
		v: null,
		w: 0,
		x: current_component_context,
		y: null
	};

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
 * Internal representation of `$effect.active()`
 * @returns {boolean}
 */
export function effect_active() {
	return current_effect ? (current_effect.f & MANAGED) === 0 : false;
}

/**
 * Internal representation of `$effect(...)`
 * @param {() => void | (() => void)} fn
 * @returns {import('#client').Effect}
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

	const effect = create_effect(
		EFFECT,
		fn,
		false,
		current_block,
		!apply_component_effect_heuristics
	);

	if (apply_component_effect_heuristics) {
		const context = /** @type {import('#client').ComponentContext} */ (current_component_context);
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
	const effect = render_effect(fn, current_block, true);
	return () => {
		destroy_signal(effect);
	};
}

/**
 * @param {() => void | (() => void)} fn
 * @returns {import('#client').Effect}
 */
export function effect(fn) {
	return create_effect(EFFECT, fn, false, current_block, true);
}

/**
 * @param {() => void | (() => void)} fn
 * @returns {import('#client').Effect}
 */
export function managed_effect(fn) {
	return create_effect(EFFECT | MANAGED, fn, false, current_block, true);
}

/**
 * @param {() => void | (() => void)} fn
 * @param {boolean} sync
 * @returns {import('#client').Effect}
 */
export function managed_pre_effect(fn, sync) {
	return create_effect(PRE_EFFECT | MANAGED, fn, sync, current_block, true);
}

/**
 * Internal representation of `$effect.pre(...)`
 * @param {() => void | (() => void)} fn
 * @returns {import('#client').Effect}
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
	return create_effect(
		PRE_EFFECT,
		() => {
			const val = fn();
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
 * @param {() => void | (() => void)} fn
 * @returns {import('#client').Effect}
 */
export function invalidate_effect(fn) {
	return create_effect(PRE_EFFECT, fn, true, current_block, true);
}

/**
 * @template {import('#client').Block} B
 * @param {(block: B) => void | (() => void)} fn
 * @param {any} block
 * @param {any} managed
 * @param {any} sync
 * @returns {import('#client').Effect}
 */
export function render_effect(fn, block = current_block, managed = false, sync = true) {
	let flags = RENDER_EFFECT;
	if (managed) {
		flags |= MANAGED;
	}
	return create_effect(flags, /** @type {any} */ (fn), sync, block, true);
}

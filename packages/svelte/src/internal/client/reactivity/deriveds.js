import { DEV } from 'esm-env';
import { CLEAN, DERIVED, UNINITIALIZED, UNOWNED } from '../constants.js';
import { current_block, current_consumer, current_effect } from '../runtime.js';
import { push_reference } from './effects.js';
import { default_equals, safe_equal } from './equality.js';

/**
 * @template V
 * @param {() => V} fn
 * @returns {import('../types.js').Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived(fn) {
	const is_unowned = current_effect === null;
	const flags = is_unowned ? DERIVED | UNOWNED : DERIVED;
	const signal = /** @type {import('../types.js').Derived<V>} */ ({
		b: current_block,
		c: null,
		d: null,
		e: default_equals,
		f: flags | CLEAN,
		i: fn,
		r: null,
		v: UNINITIALIZED,
		w: 0,
		x: null,
		y: null
	});

	if (DEV) {
		// @ts-expect-error
		signal.inspect = new Set();
	}

	if (current_consumer !== null) {
		push_reference(current_consumer, signal);
	}

	return signal;
}

/**
 * @template V
 * @param {() => V} fn
 * @returns {import('../types.js').Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived_safe_equal(fn) {
	const signal = derived(fn);
	signal.e = safe_equal;
	return signal;
}

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
	let flags = DERIVED | CLEAN;
	if (current_effect === null) flags |= UNOWNED;

	/** @type {import('#client').Derived<V>} */
	const signal = {
		b: current_block,
		c: null,
		d: null,
		e: default_equals,
		f: flags,
		i: fn,
		r: null,
		// @ts-expect-error
		v: UNINITIALIZED,
		w: 0,
		x: null,
		y: null
	};

	if (DEV) {
		/** @type {import('#client').DerivedDebug} */ (signal).inspect = new Set();
	}

	if (current_consumer !== null) {
		push_reference(current_consumer, signal);
	}

	return signal;
}

/**
 * @template V
 * @param {() => V} fn
 * @returns {import('#client').Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived_safe_equal(fn) {
	const signal = derived(fn);
	signal.e = safe_equal;
	return signal;
}

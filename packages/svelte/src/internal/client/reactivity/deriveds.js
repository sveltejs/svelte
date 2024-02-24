import { DEV } from 'esm-env';
import { CLEAN, DERIVED, UNINITIALIZED, UNOWNED } from '../constants.js';
import { current_consumer, current_effect } from '../runtime.js';
import { default_equals, safe_equal } from './equality.js';

/**
 * @template V
 * @param {() => V} fn
 * @returns {import('#client').Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived(fn) {
	let flags = DERIVED | CLEAN;
	if (current_effect === null) flags |= UNOWNED;

	/** @type {import('#client').Derived<V>} */
	const signal = {
		c: null,
		d: null,
		e: default_equals,
		f: flags,
		i: fn,
		r: null,
		// @ts-expect-error
		v: UNINITIALIZED,
		w: 0,
		parent: current_effect
	};

	if (DEV) {
		// @ts-expect-error
		signal.inspect = new Set();
	}

	if (current_consumer !== null) {
		if (current_consumer.r === null) {
			current_consumer.r = [signal];
		} else {
			current_consumer.r.push(signal);
		}
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

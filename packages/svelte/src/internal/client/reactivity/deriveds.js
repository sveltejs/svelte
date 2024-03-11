import { DEV } from 'esm-env';
import { CLEAN, DERIVED, DESTROYED, UNINITIALIZED, UNOWNED } from '../constants.js';
import {
	IS_EFFECT,
	current_block,
	current_consumer,
	current_effect,
	destroy_references,
	remove_consumers,
	set_signal_status
} from '../runtime.js';
import { push_reference } from './effects.js';
import { default_equals, safe_equal } from './equality.js';
import { is_array } from '../utils.js';
import { run_all } from '../../common.js';

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

/**
 * @param {import('#client').Derived} signal
 * @returns {void}
 */
export function destroy_derived(signal) {
	destroy_references(signal);
	remove_consumers(signal, 0);
	// @ts-expect-error `signal.i` cannot be `null` while the signal is alive
	signal.i = signal.r = signal.x = signal.b = signal.d = signal.c = null;
	set_signal_status(signal, DESTROYED);
}

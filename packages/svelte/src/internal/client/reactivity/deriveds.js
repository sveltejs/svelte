import { DEV } from 'esm-env';
import { CLEAN, DERIVED, DESTROYED, UNINITIALIZED, UNOWNED } from '../constants.js';
import {
	current_block,
	current_reaction,
	current_effect,
	destroy_references,
	remove_reactions,
	set_signal_status
} from '../runtime.js';
import { push_reference } from './effects.js';
import { default_equals, safe_equals } from './equality.js';

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
		reactions: null,
		deps: null,
		eq: default_equals,
		f: flags,
		fn,
		r: null,
		// @ts-expect-error
		v: UNINITIALIZED,
		w: 0,
		y: null
	};

	if (DEV) {
		/** @type {import('#client').DerivedDebug} */ (signal).inspect = new Set();
	}

	if (current_reaction !== null) {
		push_reference(current_reaction, signal);
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
	signal.eq = safe_equals;
	return signal;
}

/**
 * @param {import('#client').Derived} signal
 * @returns {void}
 */
export function destroy_derived(signal) {
	destroy_references(signal);
	remove_reactions(signal, 0);
	// @ts-expect-error `signal.i` cannot be `null` while the signal is alive
	signal.fn = signal.r = signal.x = signal.b = signal.deps = signal.reactions = null;
	set_signal_status(signal, DESTROYED);
}

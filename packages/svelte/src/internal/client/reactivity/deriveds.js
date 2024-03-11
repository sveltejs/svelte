import { DEV } from 'esm-env';
import { DERIVED, DESTROYED, DIRTY, UNOWNED } from '../constants.js';
import {
	current_reaction,
	current_effect,
	destroy_children,
	remove_reactions,
	set_signal_status
} from '../runtime.js';
import { default_equals, safe_equals } from './equality.js';

/**
 * @template V
 * @param {() => V} fn
 * @returns {import('#client').Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived(fn) {
	let flags = DERIVED | DIRTY;
	if (current_effect === null) flags |= UNOWNED;

	/** @type {import('#client').Derived<V>} */
	const signal = {
		reactions: null,
		deps: null,
		eq: default_equals,
		f: flags,
		fn,
		effects: null,
		deriveds: null,
		v: /** @type {V} */ (null),
		w: 0
	};

	if (DEV) {
		/** @type {import('#client').DerivedDebug} */ (signal).inspect = new Set();
	}

	if (current_reaction !== null) {
		if (current_reaction.deriveds === null) {
			current_reaction.deriveds = [signal];
		} else {
			current_reaction.deriveds.push(signal);
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
	signal.eq = safe_equals;
	return signal;
}

/**
 * @param {import('#client').Derived} signal
 * @returns {void}
 */
export function destroy_derived(signal) {
	destroy_children(signal);
	remove_reactions(signal, 0);
	set_signal_status(signal, DESTROYED);

	signal.effects =
		signal.deps =
		signal.reactions =
		// @ts-expect-error `signal.fn` cannot be `null` while the signal is alive
		signal.fn =
			null;
}

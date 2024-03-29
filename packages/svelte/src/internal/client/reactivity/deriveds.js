import { DEV } from 'esm-env';
import { CLEAN, DERIVED, DESTROYED, DIRTY, MAYBE_DIRTY, UNOWNED } from '../constants.js';
import {
	current_reaction,
	current_effect,
	remove_reactions,
	set_signal_status,
	mark_reactions,
	current_skip_reaction,
	execute_reaction_fn
} from '../runtime.js';
import { equals, safe_equals } from './equality.js';
import { destroy_effect } from './effects.js';

export let updating_derived = false;

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
		equals,
		f: flags,
		fn,
		effects: null,
		deriveds: null,
		v: /** @type {V} */ (null),
		version: 0
	};

	if (DEV) {
		/** @type {import('#client').DerivedDebug} */ (signal).inspect = new Set();
	}

	if (current_reaction !== null && (current_reaction.f & DERIVED) !== 0) {
		var current_derived = /** @type {import('#client').Derived<V>} */ (current_reaction);
		if (current_derived.deriveds === null) {
			current_derived.deriveds = [signal];
		} else {
			current_derived.deriveds.push(signal);
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
	signal.equals = safe_equals;
	return signal;
}

/**
 * @param {import('./types.js').Derived} signal
 * @returns {void}
 */
function destroy_derived_children(signal) {
	var effects = signal.effects;

	// TODO: should it be possible to create effects in deriveds given they're meant to be pure?
	if (effects !== null) {
		signal.effects = null;
		for (var i = 0; i < effects.length; i += 1) {
			destroy_effect(effects[i]);
		}
	}
	var deriveds = signal.deriveds;

	if (deriveds !== null) {
		signal.deriveds = null;
		for (i = 0; i < deriveds.length; i += 1) {
			destroy_derived(deriveds[i]);
		}
	}
}

/**
 * @param {import('#client').Derived} derived
 * @param {boolean} force_schedule
 * @returns {void}
 */
export function update_derived(derived, force_schedule) {
	var previous_updating_derived = updating_derived;
	updating_derived = true;
	destroy_derived_children(derived);
	var value = execute_reaction_fn(derived);
	updating_derived = previous_updating_derived;

	var status =
		(current_skip_reaction || (derived.f & UNOWNED) !== 0) && derived.deps !== null
			? MAYBE_DIRTY
			: CLEAN;

	set_signal_status(derived, status);

	if (!derived.equals(value)) {
		derived.v = value;
		mark_reactions(derived, DIRTY, force_schedule);

		if (DEV && force_schedule) {
			for (var fn of /** @type {import('#client').DerivedDebug} */ (derived).inspect) fn();
		}
	}
}

/**
 * @param {import('#client').Derived} signal
 * @returns {void}
 */
export function destroy_derived(signal) {
	destroy_derived_children(signal);
	remove_reactions(signal, 0);
	set_signal_status(signal, DESTROYED);

	signal.effects =
		signal.deps =
		signal.reactions =
		// @ts-expect-error `signal.fn` cannot be `null` while the signal is alive
		signal.fn =
			null;
}

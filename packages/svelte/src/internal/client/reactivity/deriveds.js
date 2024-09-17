/** @import { Derived, Effect } from '#client' */
import { DEV } from 'esm-env';
import { CLEAN, DERIVED, DESTROYED, DIRTY, MAYBE_DIRTY, UNOWNED } from '../constants.js';
import {
	active_reaction,
	active_effect,
	remove_reactions,
	set_signal_status,
	skip_reaction,
	update_reaction,
	increment_version
} from '../runtime.js';
import { equals, safe_equals } from './equality.js';
import * as e from '../errors.js';
import { destroy_effect } from './effects.js';
import { inspect_effects, set_inspect_effects } from './sources.js';

/**
 * @template V
 * @param {() => V} fn
 * @returns {Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived(fn) {
	let flags = DERIVED | DIRTY;
	if (active_effect === null) flags |= UNOWNED;

	/** @type {Derived<V>} */
	const signal = {
		children: null,
		deps: null,
		equals,
		f: flags,
		fn,
		reactions: null,
		v: /** @type {V} */ (null),
		version: 0
	};

	if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0) {
		var derived = /** @type {Derived} */ (active_reaction);
		(derived.children ??= []).push(signal);
	}

	return signal;
}

/**
 * @template V
 * @param {() => V} fn
 * @returns {Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived_safe_equal(fn) {
	const signal = derived(fn);
	signal.equals = safe_equals;
	return signal;
}

/**
 * @param {Derived} derived
 * @returns {void}
 */
function destroy_derived_children(derived) {
	var children = derived.children;

	if (children !== null) {
		derived.children = null;

		for (var i = 0; i < children.length; i += 1) {
			var child = children[i];
			if ((child.f & DERIVED) !== 0) {
				destroy_derived(/** @type {Derived} */ (child));
			} else {
				destroy_effect(/** @type {Effect} */ (child));
			}
		}
	}
}

/**
 * The currently updating deriveds, used to detect infinite recursion
 * in dev mode and provide a nicer error than 'too much recursion'
 * @type {Derived[]}
 */
let stack = [];

/**
 * @param {Derived} derived
 * @returns {void}
 */
export function update_derived(derived) {
	var value;

	if (DEV) {
		let prev_inspect_effects = inspect_effects;
		set_inspect_effects(new Set());
		try {
			if (stack.includes(derived)) {
				e.derived_references_self();
			}

			stack.push(derived);

			destroy_derived_children(derived);
			value = update_reaction(derived);
		} finally {
			set_inspect_effects(prev_inspect_effects);
			stack.pop();
		}
	} else {
		destroy_derived_children(derived);
		value = update_reaction(derived);
	}

	var status =
		(skip_reaction || (derived.f & UNOWNED) !== 0) && derived.deps !== null ? MAYBE_DIRTY : CLEAN;

	set_signal_status(derived, status);

	if (!derived.equals(value)) {
		derived.v = value;
		derived.version = increment_version();
	}
}

/**
 * @param {Derived} signal
 * @returns {void}
 */
function destroy_derived(signal) {
	destroy_derived_children(signal);
	remove_reactions(signal, 0);
	set_signal_status(signal, DESTROYED);

	// TODO we need to ensure we remove the derived from any parent derives

	signal.children =
		signal.deps =
		signal.reactions =
		// @ts-expect-error `signal.fn` cannot be `null` while the signal is alive
		signal.fn =
			null;
}

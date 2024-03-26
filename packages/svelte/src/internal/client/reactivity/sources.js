import { DEV } from 'esm-env';
import {
	current_component_context,
	current_reaction,
	current_dependencies,
	current_effect,
	current_untracked_writes,
	current_untracking,
	flushSync,
	get,
	is_batching_effect,
	is_runes,
	mark_reactions,
	schedule_effect,
	set_current_untracked_writes,
	set_last_inspected_signal,
	set_signal_status,
	untrack
} from '../runtime.js';
import { equals, safe_equals } from './equality.js';
import { CLEAN, DERIVED, DIRTY, MANAGED, UNINITIALIZED } from '../constants.js';

/**
 * @template V
 * @param {V} value
 * @returns {import('#client').Source<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function source(value) {
	/** @type {import('#client').Source<V>} */
	const source = {
		f: 0, // TODO ideally we could skip this altogether, but it causes type errors
		reactions: null,
		equals: equals,
		v: value,
		version: 0
	};

	if (DEV) {
		/** @type {import('#client').ValueDebug<V>} */ (source).inspect = new Set();
	}

	return source;
}

/**
 * @template V
 * @param {V} initial_value
 * @returns {import('#client').Source<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function mutable_source(initial_value) {
	const s = source(initial_value);
	s.equals = safe_equals;

	// bind the signal to the component context, in case we need to
	// track updates to trigger beforeUpdate/afterUpdate callbacks
	if (current_component_context) {
		(current_component_context.d ??= []).push(s);
	}

	return s;
}

/**
 * @template V
 * @param {import('#client').Source<V>} signal
 * @param {V} value
 * @returns {void}
 */
export function set_sync(signal, value) {
	flushSync(() => set(signal, value));
}

/**
 * @template V
 * @param {import('#client').Value<V>} source
 * @param {V} value
 */
export function mutate(source, value) {
	set(
		source,
		untrack(() => get(source))
	);
	return value;
}

/**
 * @template V
 * @param {import('#client').Source<V>} signal
 * @param {V} value
 * @returns {V}
 */
export function set(signal, value) {
	var initialized = signal.v !== UNINITIALIZED;

	if (
		!current_untracking &&
		initialized &&
		current_reaction !== null &&
		is_runes() &&
		(current_reaction.f & DERIVED) !== 0
	) {
		throw new Error(
			'ERR_SVELTE_UNSAFE_MUTATION' +
				(DEV
					? ": Unsafe mutations during Svelte's render or derived phase are not permitted in runes mode. " +
						'This can lead to unexpected errors and possibly cause infinite loops.\n\nIf this mutation is not meant ' +
						'to be reactive do not use the "$state" rune for that declaration.'
					: '')
		);
	}

	if (!signal.equals(value)) {
		signal.v = value;

		// Increment write version so that unowned signals can properly track dirtiness
		signal.version++;

		// If the current signal is running for the first time, it won't have any
		// reactions as we only allocate and assign the reactions after the signal
		// has fully executed. So in the case of ensuring it registers the reaction
		// properly for itself, we need to ensure the current effect actually gets
		// scheduled. i.e:
		//
		// $effect(() => x++)
		//
		// We additionally want to skip this logic when initialising store sources
		if (
			is_runes() &&
			initialized &&
			current_effect !== null &&
			(current_effect.f & CLEAN) !== 0 &&
			(current_effect.f & MANAGED) === 0
		) {
			if (current_dependencies !== null && current_dependencies.includes(signal)) {
				set_signal_status(current_effect, DIRTY);
				schedule_effect(current_effect);
			} else {
				if (current_untracked_writes === null) {
					set_current_untracked_writes([signal]);
				} else {
					current_untracked_writes.push(signal);
				}
			}
		}

		mark_reactions(signal, DIRTY, true);

		if (DEV) {
			if (is_batching_effect) {
				set_last_inspected_signal(/** @type {import('#client').ValueDebug} */ (signal));
			} else {
				for (const fn of /** @type {import('#client').ValueDebug} */ (signal).inspect) fn();
			}
		}
	}

	return value;
}

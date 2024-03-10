import { DEV } from 'esm-env';
import {
	current_component_context,
	current_consumer,
	current_dependencies,
	current_effect,
	current_untracked_writes,
	current_untracking,
	flushSync,
	get,
	ignore_mutation_validation,
	is_batching_effect,
	is_runes,
	mark_signal_consumers,
	schedule_effect,
	set_current_untracked_writes,
	set_last_inspected_signal,
	set_signal_status,
	untrack
} from '../runtime.js';
import { default_equals, safe_equal } from './equality.js';
import { CLEAN, DERIVED, DIRTY, MANAGED, SOURCE } from '../constants.js';

/**
 * @template V
 * @param {V} value
 * @returns {import('#client').Source<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function source(value) {
	/** @type {import('#client').Source<V>} */
	const source = {
		c: null,
		e: default_equals,
		f: SOURCE | CLEAN,
		v: value,
		w: 0
	};

	if (DEV) {
		/** @type {import('#client').SourceDebug<V>} */ (source).inspect = new Set();
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
	s.e = safe_equal;

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
	if (
		!current_untracking &&
		!ignore_mutation_validation &&
		current_consumer !== null &&
		is_runes(null) &&
		(current_consumer.f & DERIVED) !== 0
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
	if (
		(signal.f & SOURCE) !== 0 &&
		!(/** @type {import('#client').EqualsFunctions} */ (signal.e)(value, signal.v))
	) {
		signal.v = value;
		// Increment write version so that unowned signals can properly track dirtyness
		signal.w++;
		// If the current signal is running for the first time, it won't have any
		// consumers as we only allocate and assign the consumers after the signal
		// has fully executed. So in the case of ensuring it registers the consumer
		// properly for itself, we need to ensure the current effect actually gets
		// scheduled. i.e:
		//
		// $effect(() => x++)
		//
		// We additionally want to skip this logic for when ignore_mutation_validation is
		// true, as stores write to source signal on initialisation.
		if (
			is_runes(null) &&
			!ignore_mutation_validation &&
			current_effect !== null &&
			current_effect.c === null &&
			(current_effect.f & CLEAN) !== 0 &&
			(current_effect.f & MANAGED) === 0
		) {
			if (current_dependencies !== null && current_dependencies.includes(signal)) {
				set_signal_status(current_effect, DIRTY);
				schedule_effect(current_effect, false);
			} else {
				if (current_untracked_writes === null) {
					set_current_untracked_writes([signal]);
				} else {
					current_untracked_writes.push(signal);
				}
			}
		}
		mark_signal_consumers(signal, DIRTY, true);

		// @ts-expect-error
		if (DEV && signal.inspect) {
			if (is_batching_effect) {
				set_last_inspected_signal(/** @type {import('#client').ValueDebug} */ (signal));
			} else {
				for (const fn of /** @type {import('#client').ValueDebug} */ (signal).inspect) fn();
			}
		}
	}

	return value;
}

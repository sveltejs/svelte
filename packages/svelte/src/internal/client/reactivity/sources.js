import { DEV } from 'esm-env';
import { current_component_context } from '../runtime.js';
import { default_equals, safe_equal } from './equality.js';
import { CLEAN, SOURCE } from '../constants.js';

/**
 * @template V
 * @param {V} initial_value
 * @returns {import('../types.js').SourceSignal<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function source(initial_value) {
	return create_source_signal(SOURCE | CLEAN, initial_value);
}

/**
 * @template V
 * @param {V} initial_value
 * @returns {import('../types.js').SourceSignal<V>}
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
 * @param {import('../types.js').SignalFlags} flags
 * @param {V} value
 * @returns {import('../types.js').SourceSignal<V> | import('../types.js').SourceSignal<V> & import('../types.js').SourceSignalDebug}
 */
function create_source_signal(flags, value) {
	if (DEV) {
		return {
			// consumers
			c: null,
			// equals
			e: default_equals,
			// flags
			f: flags,
			// value
			v: value,
			// write version
			w: 0,
			// this is for DEV only
			inspect: new Set()
		};
	}
	return {
		// consumers
		c: null,
		// equals
		e: default_equals,
		// flags
		f: flags,
		// value
		v: value,
		// write version
		w: 0
	};
}

import { DEV } from 'esm-env';
import { current_component_context } from '../runtime.js';
import { default_equals, safe_equal } from './equality.js';
import { CLEAN, SOURCE } from '../constants.js';

/**
 * @template V
 * @param {V} value
 * @returns {import('./types.js').Source<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function source(value) {
	/** @type {import('#client').Source<V>} */
	const source = {
		// consumers
		c: null,
		// equals
		e: default_equals,
		// flags
		f: SOURCE | CLEAN,
		// value
		v: value,
		// write version
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
 * @returns {import('./types.js').Source<V>}
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

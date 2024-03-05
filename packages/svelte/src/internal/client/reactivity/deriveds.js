import { CLEAN, DERIVED, UNINITIALIZED, UNOWNED } from '../constants.js';
import { current_block, current_consumer, current_effect } from '../runtime.js';
import { create_computation_signal, push_reference } from './effects.js';
import { default_equals, safe_equal } from './equality.js';

/**
 * @template V
 * @param {() => V} fn
 * @returns {import('../types.js').ComputationSignal<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived(fn) {
	const is_unowned = current_effect === null;
	const flags = is_unowned ? DERIVED | UNOWNED : DERIVED;
	const signal = /** @type {import('../types.js').ComputationSignal<V>} */ (
		create_computation_signal(flags | CLEAN, UNINITIALIZED, current_block)
	);
	signal.i = fn;
	signal.e = default_equals;
	if (current_consumer !== null) {
		push_reference(current_consumer, signal);
	}
	return signal;
}

/**
 * @template V
 * @param {() => V} fn
 * @returns {import('../types.js').ComputationSignal<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function derived_safe_equal(fn) {
	const signal = derived(fn);
	signal.e = safe_equal;
	return signal;
}

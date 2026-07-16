/** @import { Equals, Value } from '#client' */
import { active_batch, current_batch } from './batch.js';

/** @param {Value} signal */
function get_value(signal) {
	var batch = active_batch ?? (current_batch?.is_fork ? current_batch : null);
	var override = batch?.values?.get(signal);
	return override === undefined ? signal.v : override[0];
}

/** @type {Equals} */
export function equals(value) {
	return value === get_value(this);
}

/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
export function safe_not_equal(a, b) {
	return a != a
		? b == b
		: a !== b || (a !== null && typeof a === 'object') || typeof a === 'function';
}

/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
export function not_equal(a, b) {
	return a !== b;
}

/** @type {Equals} */
export function safe_equals(value) {
	return !safe_not_equal(value, get_value(this));
}

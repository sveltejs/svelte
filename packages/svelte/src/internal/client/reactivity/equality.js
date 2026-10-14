/** @import { Equals, Value } from '#client' */
import { DERIVED } from '#client/constants';
import { active_batch } from './batch.js';

/**
 * Sources are compared against their real value, but deriveds are compared
 * against the value they have in the currently active batch's view of the world
 * @param {Value} value
 */
function current_value(value) {
	if ((value.f & DERIVED) === 0) return value.v;

	var snapshot = active_batch?.values?.get(value);
	return snapshot ? snapshot.v : value.v;
}

/** @type {Equals} */
export function equals(value) {
	return value === current_value(this);
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
	return !safe_not_equal(value, current_value(this));
}

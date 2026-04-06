/** @import { Equals } from '#client' */
import { active_batch } from './batch.js';

/** @type {Equals} */
export function equals(value) {
	var snapshot = active_batch?.values?.get(this);
	return value === (snapshot ? snapshot.v : this.v);
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
	return !safe_not_equal(value, this.v);
}

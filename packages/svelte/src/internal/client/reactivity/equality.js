/** @import { Equals } from '#client' */

/** @type {Equals} */
export function equals(value) {
	return value === this.v;
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

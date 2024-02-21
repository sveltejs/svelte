/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
export function default_equals(a, b) {
	return a === b;
}

/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
export function safe_not_equal(a, b) {
	// eslint-disable-next-line eqeqeq
	return a != a
		? // eslint-disable-next-line eqeqeq
			b == b
		: a !== b || (a !== null && typeof a === 'object') || typeof a === 'function';
}

/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
export function safe_equal(a, b) {
	return !safe_not_equal(a, b);
}

/** @type {import('#client').Equals} */
export function equals(value) {
	return value === this.v;
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

/** @type {import('#client').Equals} */
export function safe_equals(value) {
	return !safe_not_equal(value, this.v);
}

/**
 * @param {((value?: number) => number)} fn
 * @param {1 | -1} [d]
 * @returns {number}
 */
export function update_prop(fn, d = 1) {
	const value = fn();
	fn(value + d);
	return value;
}

/**
 * @param {((value?: number) => number)} fn
 * @param {1 | -1} [d]
 * @returns {number}
 */
export function update_pre_prop(fn, d = 1) {
	const value = fn() + d;
	fn(value);
	return value;
}

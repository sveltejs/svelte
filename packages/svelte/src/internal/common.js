// eslint-disable-next-line @typescript-eslint/no-empty-function
export const EMPTY_FUNC = () => {};

// Adapted from https://github.com/then/is-promise/blob/master/index.js
// Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE

/**
 * @template [T=any]
 * @param {any} value
 * @returns {value is PromiseLike<T>}
 */
export function is_promise(value) {
	return (
		!!value &&
		(typeof value === 'object' || typeof value === 'function') &&
		typeof (/** @type {any} */ (value).then) === 'function'
	);
}

/** @param {Array<() => void>} arr */
export function run_all(arr) {
	for (var i = 0; i < arr.length; i++) {
		arr[i]();
	}
}

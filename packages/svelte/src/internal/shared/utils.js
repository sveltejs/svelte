export const noop = () => {};

// Adapted from https://github.com/then/is-promise/blob/master/index.js
// Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE

/**
 * @template [T=any]
 * @param {any} value
 * @returns {value is PromiseLike<T>}
 */
export function is_promise(value) {
	return typeof value?.then === 'function';
}

/** @param {Function} fn */
export function run(fn) {
	return fn();
}

/** @param {Array<() => void>} arr */
export function run_all(arr) {
	for (var i = 0; i < arr.length; i++) {
		arr[i]();
	}
}

/**
 * TODO replace with Promise.withResolvers once supported widely enough
 * @template T
 * @returns {PromiseWithResolvers<T>}
 */
export function deferred() {
	/** @type {(value: T) => void} */
	var resolve;

	/** @type {(reason: any) => void} */
	var reject;

	/** @type {Promise<T>} */
	var promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});

	// @ts-expect-error
	return { promise, resolve, reject };
}

// Store the references to globals in case someone tries to monkey patch these, causing the below
// to de-opt (this occurs often when using popular extensions).
export var is_array = Array.isArray;
export var index_of = Array.prototype.indexOf;
export var array_from = Array.from;
export var object_keys = Object.keys;
export var define_property = Object.defineProperty;
export var get_descriptor = Object.getOwnPropertyDescriptor;
export var get_descriptors = Object.getOwnPropertyDescriptors;
export var object_prototype = Object.prototype;
export var array_prototype = Array.prototype;
export var get_prototype_of = Object.getPrototypeOf;
export var is_extensible = Object.isExtensible;

/**
 * @param {any} thing
 * @returns {thing is Function}
 */
export function is_function(thing) {
	return typeof thing === 'function';
}

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

/**
 * @template V
 * @param {V} value
 * @param {V | (() => V)} fallback
 * @param {boolean} [lazy]
 * @returns {V}
 */
export function fallback(value, fallback, lazy = false) {
	return value === undefined
		? lazy
			? /** @type {() => V} */ (fallback)()
			: /** @type {V} */ (fallback)
		: value;
}

/**
 * When encountering a situation like `let [a, b, c] = $derived(blah())`,
 * we need to stash an intermediate value that `a`, `b`, and `c` derive
 * from, in case it's an iterable
 * @template T
 * @param {ArrayLike<T> | Iterable<T>} value
 * @param {number} [n]
 * @returns {Array<T>}
 */
export function to_array(value, n) {
	// return arrays unchanged
	if (Array.isArray(value)) {
		return value;
	}

	// if value is not iterable, or `n` is unspecified (indicates a rest
	// element, which means we're not concerned about unbounded iterables)
	// convert to an array with `Array.from`
	if (n === undefined || !(Symbol.iterator in value)) {
		return Array.from(value);
	}

	// otherwise, populate an array with `n` values

	/** @type {T[]} */
	const array = [];

	for (const element of value) {
		array.push(element);
		if (array.length === n) break;
	}

	return array;
}

/**
 * Convert an iterable to an array, immediately destructuring array elements
 * at the specified indices. This ensures that when a generator yields the same
 * array object multiple times (mutating it), we capture the values at iteration
 * time, matching for...of behavior.
 * 
 * Returns an array where each element is a new array containing the destructured
 * values, so that extract_paths can process them correctly.
 * @template T
 * @param {ArrayLike<T> | Iterable<T> | null | undefined} collection
 * @param {number[]} destructure_indices - Array indices to extract from each element
 * @returns {Array<any[]>}
 */
export function to_array_destructured(collection, destructure_indices) {
	if (collection == null) {
		return [];
	}

	const result = [];

	// Helper to destructure a single element
	const destructure_element = (element) => {
		const destructured = [];
		for (let j = 0; j < destructure_indices.length; j++) {
			destructured.push(element?.[destructure_indices[j]]);
		}
		return destructured;
	};

	// If already an array, destructure each element immediately
	if (is_array(collection)) {
		for (let i = 0; i < collection.length; i++) {
			result.push(destructure_element(collection[i]));
		}
		return result;
	}

	// For iterables, destructure during iteration
	for (const element of collection) {
		result.push(destructure_element(element));
	}

	return result;
}

/**
 * Snapshot items produced by an iterator so that destructured values reflect
 * what was yielded before the iterator mutates the value again.
 * Used for object destructuring where we need to shallow copy the object.
 * @template T
 * @param {ArrayLike<T> | Iterable<T> | null | undefined} collection
 * @param {(value: T) => T} mapper
 * @returns {Array<T>}
 */
export function snapshot_each_value(collection, mapper) {
	if (collection == null) {
		return [];
	}

	return is_array(collection) ? collection : array_from(collection, mapper);
}

/**
 * @param {any} value
 */
export function snapshot_object(value) {
	return value == null || typeof value !== 'object' ? value : { ...value };
}

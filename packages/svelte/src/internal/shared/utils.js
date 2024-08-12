// Store the references to globals in case someone tries to monkey patch these, causing the below
// to de-opt (this occurs often when using popular extensions).
export var is_array = Array.isArray;
export var array_from = Array.from;
export var object_keys = Object.keys;
export var object_assign = Object.assign;
export var is_frozen = Object.isFrozen;
export var object_freeze = Object.freeze;
export var define_property = Object.defineProperty;
export var get_descriptor = Object.getOwnPropertyDescriptor;
export var get_descriptors = Object.getOwnPropertyDescriptors;
export var object_prototype = Object.prototype;
export var array_prototype = Array.prototype;
export var get_prototype_of = Object.getPrototypeOf;

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

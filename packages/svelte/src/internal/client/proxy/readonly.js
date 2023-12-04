import { define_property, get_descriptor } from '../utils.js';

/**
 * @template {Record<string | symbol, any>} T
 * @typedef {T & { [READONLY_SYMBOL]: Proxy<T> }} StateObject
 */

export const READONLY_SYMBOL = Symbol('readonly');

const object_prototype = Object.prototype;
const array_prototype = Array.prototype;
const get_prototype_of = Object.getPrototypeOf;
const is_frozen = Object.isFrozen;

/**
 * @template {Record<string | symbol, any>} T
 * @template {StateObject<T>} U
 * @param {U} value
 * @returns {Proxy<U> | U}
 */
export function readonly(value) {
	const proxy = value && value[READONLY_SYMBOL];
	if (proxy) return proxy;

	if (
		typeof value === 'object' &&
		value != null &&
		!is_frozen(value) &&
		!(READONLY_SYMBOL in value)
	) {
		const prototype = get_prototype_of(value);

		// TODO handle Map and Set as well
		if (prototype === object_prototype || prototype === array_prototype) {
			const proxy = new Proxy(value, handler);
			define_property(value, READONLY_SYMBOL, { value: proxy, writable: false });

			return proxy;
		}
	}

	return value;
}

/** @returns {never} */
const readonly_error = () => {
	throw new Error(`Props are read-only, unless used with \`bind:\``);
};

/** @type {ProxyHandler<StateObject<any>>} */
const handler = {
	defineProperty: readonly_error,
	deleteProperty: readonly_error,
	set: readonly_error,

	get(target, prop, receiver) {
		const value = Reflect.get(target, prop, receiver);

		if (!(prop in target)) {
			return readonly(value);
		}

		return value;
	}
};

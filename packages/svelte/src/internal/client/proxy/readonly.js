import { define_property, is_frozen } from '../utils.js';
import { READONLY_SYMBOL, STATE_SYMBOL } from './proxy.js';

/**
 * @template {Record<string | symbol, any>} T
 * @typedef {T & { [READONLY_SYMBOL]: Proxy<T> }} StateObject
 */

/**
 * Expects a value that was wrapped with `proxy` and makes it readonly.
 *
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
		STATE_SYMBOL in value && // TODO handle Map and Set as well
		!(READONLY_SYMBOL in value)
	) {
		const proxy = new Proxy(value, handler);
		define_property(value, READONLY_SYMBOL, { value: proxy, writable: false });
		return proxy;
	}

	return value;
}

/**
 * @param {any}	_
 * @param {string} prop
 * @returns {never}
 */
const readonly_error = (_, prop) => {
	throw new Error(
		`Non-bound props cannot be mutated — to make the \`${prop}\` settable, ensure the object it is used within is bound as a prop \`bind:<prop>={...}\`. Fallback values can never be mutated.`
	);
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

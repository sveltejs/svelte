import { effect_active, get, set, increment, source } from './runtime.js';

export const MAGIC_SYMBOL = Symbol();
export const MAGIC_EACH_SYMBOL = Symbol();

/**
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function magic(value) {
	if (value && typeof value === 'object') {
		return wrap(value, null);
	}

	return value;
}

/**
 * @template T
 * @param {T} value
 * @param {T | null} parent
 * @returns {T}
 */
function wrap(value, parent) {
	if (value && typeof value === 'object') {
		return object(value, parent);
	}

	return value;
}

/**
 * @template {Record<string | symbol, any>} T
 * @template P
 * @param {T} value
 * @param {P | null} parent
 * @returns {T}
 */
function object(value, parent) {
	if (MAGIC_SYMBOL in value) return value;

	/** @type {Map<string | symbol, any>} */
	const sources = new Map();
	let version = source(0);

	const is_array = Array.isArray(value);

	return new Proxy(value, {
		get(target, prop, receiver) {
			if (prop === MAGIC_EACH_SYMBOL) {
				return parent;
			}
			let s = sources.get(prop);

			if (s === undefined && effect_active()) {
				s = source(wrap(target[prop], receiver));
				sources.set(prop, s);
			}

			const value = s !== undefined ? get(s) : target[prop];

			if (typeof value === 'function') {
				// @ts-ignore
				return (...args) => {
					return value.apply(receiver, args);
				};
			}
			return value;
		},
		set(target, prop, value) {
			const s = sources.get(prop);
			if (s !== undefined) set(s, wrap(value, target));

			if (is_array && prop === 'length') {
				for (let i = value; i < target.length; i += 1) {
					const s = sources.get(i + '');
					if (s !== undefined) set(s, undefined);
				}
			}

			if (!(prop in target)) increment(version);
			// @ts-ignore
			target[prop] = value;

			return true;
		},
		deleteProperty(target, prop) {
			const s = sources.get(prop);
			if (s !== undefined) set(s, undefined);

			if (prop in target) increment(version);

			return delete target[prop];
		},
		has(target, prop) {
			if (prop === MAGIC_SYMBOL) return true;

			get(version);
			return Reflect.has(target, prop);
		},
		ownKeys(target) {
			get(version);
			return Reflect.ownKeys(target);
		}
	});
}

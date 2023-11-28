import { effect_active, get, set, increment, source } from './runtime.js';

const symbol = Symbol('magic');

/**
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function magic(value) {
	if (value && typeof value === 'object') {
		return object(value);
	}

	return value;
}

/**
 * @template {Record<string | symbol, any>} T
 * @param {T} value
 * @returns {T}
 */
function object(value) {
	if (symbol in value) return value;

	/** @type {Map<string | symbol, any>} */
	const sources = new Map();
	let version = source(0);

	return new Proxy(value, {
		get(target, prop, receiver) {
			let s = sources.get(prop);

			if (effect_active() && !s) {
				s = source(magic(target[prop]));
				sources.set(prop, s);
			}

			const value = s ? get(s) : target[prop];

			if (typeof value === 'function') {
				return (...args) => {
					return value.apply(receiver, args);
				};
			}

			return value;
		},
		set(target, prop, value) {
			const s = sources.get(prop);
			if (s) set(s, magic(value));

			if (!(prop in target)) increment(version);
			target[prop] = value;

			return true;
		},
		deleteProperty(target, prop) {
			const s = sources.get(prop);
			if (s) set(s, undefined);

			if (prop in target) increment(version);

			return delete target[prop];
		},
		has(target, prop) {
			if (prop === symbol) return true;

			get(version);
			return Reflect.has(target, prop);
		},
		ownKeys(target) {
			get(version);
			return Reflect.ownKeys(target);
		}
	});
}

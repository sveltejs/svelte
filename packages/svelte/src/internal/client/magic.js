import { effect_active, get, set, increment, source } from './runtime.js';

/** @typedef {{ p: MagicObject | null; s: Map<string | symbol, import('./types').SourceSignal<any>>; v: import('./types').SourceSignal<number>; a: boolean }} Magic */
/** @typedef {Record<string | symbol, any> & { [MAGIC_SYMBOL]: Magic }} MagicObject */

export const MAGIC_SYMBOL = Symbol();
export const MAGIC_EACH_SYMBOL = Symbol();

/**
 * @template {MagicObject} T
 * @param {T} value
 * @returns {T}
 */
export function magic(value) {
	return wrap(value, null);
}

/**
 * @template {MagicObject} T
 * @template {MagicObject} P
 * @param {T} value
 * @param {P | null} parent
 * @returns {T}
 */
function wrap(value, parent) {
	if (value && typeof value === 'object') {
		return proxy(value, parent);
	}

	return value;
}

/** @type {ProxyHandler<MagicObject>} */
const handler = {
	get(target, prop, receiver) {
		if (prop === MAGIC_EACH_SYMBOL) {
			return parent;
		}

		const metadata = target[MAGIC_SYMBOL];
		let s = metadata.s.get(prop);

		if (s === undefined && effect_active()) {
			s = source(wrap(target[prop], receiver));
			metadata.s.set(prop, s);
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
		const metadata = target[MAGIC_SYMBOL];

		const s = metadata.s.get(prop);
		if (s !== undefined) set(s, wrap(value, target));

		if (metadata.a && prop === 'length') {
			for (let i = value; i < target.length; i += 1) {
				const s = metadata.s.get(i + '');
				if (s !== undefined) set(s, undefined);
			}
		}

		if (!(prop in target)) increment(metadata.v);
		// @ts-ignore
		target[prop] = value;

		return true;
	},
	deleteProperty(target, prop) {
		const metadata = target[MAGIC_SYMBOL];

		const s = metadata.s.get(prop);
		if (s !== undefined) set(s, undefined);

		if (prop in target) increment(metadata.v);

		return delete target[prop];
	},
	has(target, prop) {
		if (prop === MAGIC_SYMBOL) return true;

		const metadata = target[MAGIC_SYMBOL];

		get(metadata.v);
		return Reflect.has(target, prop);
	},
	ownKeys(target) {
		const metadata = target[MAGIC_SYMBOL];

		get(metadata.v);
		return Reflect.ownKeys(target);
	}
};

/**
 * @template {MagicObject} T
 * @template {MagicObject} P
 * @param {T} value
 * @param {P | null} parent
 * @returns {T}
 */
function proxy(value, parent) {
	if (MAGIC_SYMBOL in value) return value;

	// @ts-expect-error
	value[MAGIC_SYMBOL] = init(value, parent);

	// @ts-expect-error not sure how to fix this
	return new Proxy(value, handler);
}

/**
 * @param {MagicObject} value
 * @param {MagicObject | null} parent
 * @returns {Magic}
 */
function init(value, parent) {
	return {
		p: parent,
		s: new Map(),
		v: source(0),
		a: Array.isArray(value)
	};
}

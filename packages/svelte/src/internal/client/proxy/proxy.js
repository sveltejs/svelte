import { DEV } from 'esm-env';
import {
	effect_active,
	get,
	set,
	increment,
	source,
	updating_derived,
	UNINITIALIZED
} from '../runtime.js';
import { define_property, get_descriptor, is_array } from '../utils.js';
import { READONLY_SYMBOL } from './readonly.js';

/** @typedef {{ s: Map<string | symbol, import('../types.js').SourceSignal<any>>; v: import('../types.js').SourceSignal<number>; a: boolean }} Metadata */
/** @typedef {Record<string | symbol, any> & { [STATE_SYMBOL]: Metadata }} StateObject */

export const STATE_SYMBOL = Symbol('$state');

const object_prototype = Object.prototype;
const array_prototype = Array.prototype;
const get_prototype_of = Object.getPrototypeOf;
const is_frozen = Object.isFrozen;

/**
 * @template {StateObject} T
 * @param {T} value
 * @returns {T}
 */
export function proxy(value) {
	if (typeof value === 'object' && value != null && !is_frozen(value) && !(STATE_SYMBOL in value)) {
		const prototype = get_prototype_of(value);

		// TODO handle Map and Set as well
		if (prototype === object_prototype || prototype === array_prototype) {
			define_property(value, STATE_SYMBOL, { value: init(value), writable: false });

			// @ts-expect-error not sure how to fix this
			return new Proxy(value, handler);
		}
	}

	return value;
}

/**
 * @param {StateObject} value
 * @returns {Metadata}
 */
function init(value) {
	return {
		s: new Map(),
		v: source(0),
		a: is_array(value)
	};
}

/** @type {ProxyHandler<StateObject>} */
const handler = {
	defineProperty(target, prop, descriptor) {
		if (descriptor.value) {
			const metadata = target[STATE_SYMBOL];

			const s = metadata.s.get(prop);
			if (s !== undefined) set(s, proxy(descriptor.value));
		}

		return Reflect.defineProperty(target, prop, descriptor);
	},

	deleteProperty(target, prop) {
		const metadata = target[STATE_SYMBOL];

		const s = metadata.s.get(prop);
		if (s !== undefined) set(s, UNINITIALIZED);

		if (prop in target) increment(metadata.v);

		return delete target[prop];
	},

	get(target, prop, receiver) {
		if (prop === READONLY_SYMBOL) return target[READONLY_SYMBOL];

		const metadata = target[STATE_SYMBOL];
		let s = metadata.s.get(prop);

		// if we're reading a property in a reactive context, create a source,
		// but only if it's an own property and not a prototype property
		if (
			s === undefined &&
			(effect_active() || updating_derived) &&
			(!(prop in target) || get_descriptor(target, prop)?.writable)
		) {
			s = source(proxy(target[prop]));
			metadata.s.set(prop, s);
		}

		const value = s !== undefined ? get(s) : Reflect.get(target, prop, receiver);
		return value === UNINITIALIZED ? undefined : value;
	},

	getOwnPropertyDescriptor(target, prop) {
		const descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
		if (descriptor && 'value' in descriptor) {
			const metadata = target[STATE_SYMBOL];
			const s = metadata.s.get(prop);

			if (s) {
				descriptor.value = get(s);
			}
		}

		return descriptor;
	},

	has(target, prop) {
		if (prop === STATE_SYMBOL) {
			return true;
		}
		const metadata = target[STATE_SYMBOL];
		const has = Reflect.has(target, prop);

		let s = metadata.s.get(prop);
		if (s !== undefined || (effect_active() && (!has || get_descriptor(target, prop)?.writable))) {
			if (s === undefined) {
				s = source(has ? proxy(target[prop]) : UNINITIALIZED);
				metadata.s.set(prop, s);
			}
			const value = get(s);
			if (value === UNINITIALIZED) {
				return false;
			}
		}
		return has;
	},

	set(target, prop, value) {
		if (prop === READONLY_SYMBOL) {
			target[READONLY_SYMBOL] = value;
			return true;
		}

		const metadata = target[STATE_SYMBOL];

		const s = metadata.s.get(prop);
		if (s !== undefined) set(s, proxy(value));

		if (metadata.a && prop === 'length') {
			for (let i = value; i < target.length; i += 1) {
				const s = metadata.s.get(i + '');
				if (s !== undefined) set(s, UNINITIALIZED);
			}
		}

		if (!(prop in target)) increment(metadata.v);
		// @ts-ignore
		target[prop] = value;

		return true;
	},

	ownKeys(target) {
		const metadata = target[STATE_SYMBOL];

		get(metadata.v);
		return Reflect.ownKeys(target);
	}
};

if (DEV) {
	handler.setPrototypeOf = () => {
		throw new Error('Cannot set prototype of $state object');
	};
}

export { readonly } from './readonly.js';

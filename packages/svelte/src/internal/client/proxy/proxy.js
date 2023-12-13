import { DEV } from 'esm-env';
import {
	effect_active,
	get,
	set,
	update,
	source,
	updating_derived,
	UNINITIALIZED,
	mutable_source,
	batch_inspect
} from '../runtime.js';
import {
	define_property,
	get_descriptor,
	get_descriptors,
	is_array,
	object_keys
} from '../utils.js';

/** @typedef {{ s: Map<string | symbol, import('../types.js').SourceSignal<any>>; v: import('../types.js').SourceSignal<number>; a: boolean, i: boolean, p: StateObject }} Metadata */
/** @typedef {Record<string | symbol, any> & { [STATE_SYMBOL]: Metadata }} StateObject */

export const STATE_SYMBOL = Symbol('$state');
export const READONLY_SYMBOL = Symbol('readonly');

const object_prototype = Object.prototype;
const array_prototype = Array.prototype;
const get_prototype_of = Object.getPrototypeOf;
const is_frozen = Object.isFrozen;

/**
 * @template {StateObject} T
 * @param {T} value
 * @param {boolean} [immutable]
 * @returns {T}
 */
export function proxy(value, immutable = true) {
	if (typeof value === 'object' && value != null && !is_frozen(value)) {
		if (STATE_SYMBOL in value) {
			return /** @type {T} */ (value[STATE_SYMBOL].p);
		}

		const prototype = get_prototype_of(value);

		// TODO handle Map and Set as well
		if (prototype === object_prototype || prototype === array_prototype) {
			const proxy = new Proxy(value, handler);
			define_property(value, STATE_SYMBOL, {
				value: init(value, proxy, immutable),
				writable: false
			});

			// @ts-expect-error not sure how to fix this
			return proxy;
		}
	}

	return value;
}

/**
 * @template {StateObject} T
 * @param {T} value
 * @param {Map<T, Record<string | symbol, any>>} already_unwrapped
 * @returns {Record<string | symbol, any>}
 */
function unwrap(value, already_unwrapped = new Map()) {
	if (typeof value === 'object' && value != null && !is_frozen(value) && STATE_SYMBOL in value) {
		const unwrapped = already_unwrapped.get(value);
		if (unwrapped !== undefined) {
			return unwrapped;
		}
		if (is_array(value)) {
			/** @type {Record<string | symbol, any>} */
			const array = [];
			already_unwrapped.set(value, array);
			for (const element of value) {
				array.push(unwrap(element, already_unwrapped));
			}
			return array;
		} else {
			/** @type {Record<string | symbol, any>} */
			const obj = {};
			const keys = object_keys(value);
			const descriptors = get_descriptors(value);
			already_unwrapped.set(value, obj);
			for (const key of keys) {
				if (descriptors[key].get) {
					define_property(obj, key, descriptors[key]);
				} else {
					/** @type {T} */
					const property = value[key];
					obj[key] = unwrap(property, already_unwrapped);
				}
			}
			return obj;
		}
	}
	return value;
}

/**
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function unstate(value) {
	return /** @type {T} */ (unwrap(/** @type {StateObject} */ (value)));
}

/**
 * @param {StateObject} value
 * @param {StateObject} proxy
 * @param {boolean} immutable
 * @returns {Metadata}
 */
function init(value, proxy, immutable) {
	return {
		s: new Map(),
		v: source(0),
		a: is_array(value),
		i: immutable,
		p: proxy
	};
}

/** @type {ProxyHandler<StateObject>} */
const handler = {
	defineProperty(target, prop, descriptor) {
		if (descriptor.value) {
			const metadata = target[STATE_SYMBOL];

			const s = metadata.s.get(prop);
			if (s !== undefined) set(s, proxy(descriptor.value, metadata.i));
		}

		return Reflect.defineProperty(target, prop, descriptor);
	},

	deleteProperty(target, prop) {
		const metadata = target[STATE_SYMBOL];

		const s = metadata.s.get(prop);
		if (s !== undefined) set(s, UNINITIALIZED);

		if (prop in target) update(metadata.v);

		return delete target[prop];
	},

	get(target, prop, receiver) {
		if (DEV && prop === READONLY_SYMBOL) {
			return Reflect.get(target, READONLY_SYMBOL);
		}
		const metadata = target[STATE_SYMBOL];
		let s = metadata.s.get(prop);

		// if we're reading a property in a reactive context, create a source,
		// but only if it's an own property and not a prototype property
		if (
			s === undefined &&
			(effect_active() || updating_derived) &&
			(!(prop in target) || get_descriptor(target, prop)?.writable)
		) {
			s = (metadata.i ? source : mutable_source)(proxy(target[prop], metadata.i));
			metadata.s.set(prop, s);
		}

		if (s !== undefined) {
			const value = get(s);
			return value === UNINITIALIZED ? undefined : value;
		}

		if (DEV) {
			if (typeof target[prop] === 'function' && prop !== Symbol.iterator) {
				return batch_inspect(target, prop, receiver);
			}
		}
		return Reflect.get(target, prop, receiver);
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
		if (DEV && prop === READONLY_SYMBOL) {
			return Reflect.has(target, READONLY_SYMBOL);
		}
		if (prop === STATE_SYMBOL) {
			return true;
		}
		const metadata = target[STATE_SYMBOL];
		const has = Reflect.has(target, prop);

		let s = metadata.s.get(prop);
		if (s !== undefined || (effect_active() && (!has || get_descriptor(target, prop)?.writable))) {
			if (s === undefined) {
				s = (metadata.i ? source : mutable_source)(
					has ? proxy(target[prop], metadata.i) : UNINITIALIZED
				);
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
		if (DEV && prop === READONLY_SYMBOL) {
			target[READONLY_SYMBOL] = value;
			return true;
		}
		const metadata = target[STATE_SYMBOL];
		const s = metadata.s.get(prop);
		if (s !== undefined) set(s, proxy(value, metadata.i));
		const is_array = metadata.a;
		const not_has = !(prop in target);

		if (is_array && prop === 'length') {
			for (let i = value; i < target.length; i += 1) {
				const s = metadata.s.get(i + '');
				if (s !== undefined) set(s, UNINITIALIZED);
			}
		}
		if (not_has) {
			update(metadata.v);
		}
		// @ts-ignore
		target[prop] = value;

		// If we have mutated an array directly, we might need to
		// signal that length has also changed too.
		if (is_array && not_has) {
			const ls = metadata.s.get('length');
			const length = target.length;
			if (ls !== undefined && ls.v !== length) {
				set(ls, length);
			}
		}

		return true;
	},

	ownKeys(target) {
		const metadata = target[STATE_SYMBOL];

		get(metadata.v);
		return Reflect.ownKeys(target);
	}
};

/** @param {any} object */
export function observe(object) {
	const metadata = object[STATE_SYMBOL];
	if (metadata) get(metadata.v);
}

if (DEV) {
	handler.setPrototypeOf = () => {
		throw new Error('Cannot set prototype of $state object');
	};
}

export { readonly } from './readonly.js';

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
} from './runtime.js';
import {
	array_prototype,
	define_property,
	get_descriptor,
	get_descriptors,
	get_prototype_of,
	is_array,
	is_frozen,
	object_keys,
	object_prototype
} from './utils.js';

export const STATE_SYMBOL = Symbol('$state');
export const READONLY_SYMBOL = Symbol('readonly');

/**
 * @template T
 * @param {T} value
 * @param {boolean} [immutable]
 * @returns {import('./types.js').ProxyStateObject<T> | T}
 */
export function proxy(value, immutable = true) {
	if (typeof value === 'object' && value != null && !is_frozen(value)) {
		if (STATE_SYMBOL in value) {
			return /** @type {import('./types.js').ProxyMetadata<T>} */ (value[STATE_SYMBOL]).p;
		}

		const prototype = get_prototype_of(value);

		// TODO handle Map and Set as well
		if (prototype === object_prototype || prototype === array_prototype) {
			const proxy = new Proxy(
				value,
				/** @type {ProxyHandler<import('./types.js').ProxyStateObject<T>>} */ (state_proxy_handler)
			);
			define_property(value, STATE_SYMBOL, {
				value: init(
					/** @type {import('./types.js').ProxyStateObject<T>} */ (value),
					/** @type {import('./types.js').ProxyStateObject<T>} */ (proxy),
					immutable
				),
				writable: false
			});

			return proxy;
		}
	}

	return value;
}

/**
 * @template {import('./types.js').ProxyStateObject} T
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
	return /** @type {T} */ (unwrap(/** @type {import('./types.js').ProxyStateObject} */ (value)));
}

/**
 * @param {import('./types.js').ProxyStateObject} value
 * @param {import('./types.js').ProxyStateObject} proxy
 * @param {boolean} immutable
 * @returns {import('./types.js').ProxyMetadata}
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

/** @type {ProxyHandler<import('./types.js').ProxyStateObject>} */
const state_proxy_handler = {
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
		const is_array = metadata.a;
		const boolean = delete target[prop];

		// If we have mutated an array directly, and the deletion
		// was successful we will also need to update the length
		// before updating the field or the version. This is to
		// ensure any effects observing length can execute before
		// effects that listen to the fields – otherwise they will
		// operate an an index that no longer exists.
		if (is_array && boolean) {
			const ls = metadata.s.get('length');
			const length = target.length - 1;
			if (ls !== undefined && ls.v !== length) {
				set(ls, length);
			}
		}
		if (s !== undefined) set(s, UNINITIALIZED);

		if (prop in target) update(metadata.v);

		return boolean;
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

		// variable.length = value -> clear all signals with index >= value
		if (is_array && prop === 'length') {
			for (let i = value; i < target.length; i += 1) {
				const s = metadata.s.get(i + '');
				if (s !== undefined) set(s, UNINITIALIZED);
			}
		}

		// Set the new value before updating any signals so that any listeners get the new value
		// @ts-ignore
		target[prop] = value;

		if (not_has) {
			// If we have mutated an array directly, we might need to
			// signal that length has also changed. Do it before updating metadata
			// to ensure that iterating over the array as a result of a metadata update
			// will not cause the length to be out of sync.
			if (is_array) {
				const ls = metadata.s.get('length');
				const length = target.length;
				if (ls !== undefined && ls.v !== length) {
					set(ls, length);
				}
			}

			update(metadata.v);
		}

		return true;
	},

	ownKeys(target) {
		const metadata = target[STATE_SYMBOL];

		get(metadata.v);
		return Reflect.ownKeys(target);
	}
};

if (DEV) {
	state_proxy_handler.setPrototypeOf = () => {
		throw new Error('Cannot set prototype of $state object');
	};
}

/**
 * Expects a value that was wrapped with `proxy` and makes it readonly.
 *
 * @template {Record<string | symbol, any>} T
 * @template {import('./types.js').ProxyReadonlyObject<T> | T} U
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
		const proxy = new Proxy(
			value,
			/** @type {ProxyHandler<import('./types.js').ProxyReadonlyObject<U>>} */ (
				readonly_proxy_handler
			)
		);
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

/** @type {ProxyHandler<import('./types.js').ProxyReadonlyObject>} */
const readonly_proxy_handler = {
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

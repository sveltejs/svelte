import { DEV } from 'esm-env';
import { get, current_component_context, untrack, current_effect } from './runtime.js';
import {
	array_prototype,
	define_property,
	get_descriptor,
	get_descriptors,
	get_prototype_of,
	is_array,
	is_frozen,
	object_prototype
} from './utils.js';
import { check_ownership, widen_ownership } from './dev/ownership.js';
import { mutable_source, source, set } from './reactivity/sources.js';
import { STATE_FROZEN_SYMBOL, STATE_SYMBOL } from './constants.js';
import { UNINITIALIZED } from '../../constants.js';
import * as e from './errors.js';

/**
 * @template T
 * @param {T} value
 * @param {boolean} [immutable]
 * @param {import('#client').ProxyMetadata | null} [parent]
 * @param {import('#client').Source<T>} [prev] dev mode only
 * @returns {import('#client').ProxyStateObject<T> | T}
 */
export function proxy(value, immutable = true, parent = null, prev) {
	if (
		typeof value === 'object' &&
		value != null &&
		!is_frozen(value) &&
		!(STATE_FROZEN_SYMBOL in value)
	) {
		// If we have an existing proxy, return it...
		if (STATE_SYMBOL in value) {
			const metadata = /** @type {import('#client').ProxyMetadata<T>} */ (value[STATE_SYMBOL]);

			// ...unless the proxy belonged to a different object, because
			// someone copied the state symbol using `Reflect.ownKeys(...)`
			if (metadata.t === value || metadata.p === value) {
				if (DEV) {
					// Since original parent relationship gets lost, we need to copy over ancestor owners
					// into current metadata. The object might still exist on both, so we need to widen it.
					widen_ownership(metadata, metadata);
					metadata.parent = parent;
				}

				return metadata.p;
			}
		}

		const prototype = get_prototype_of(value);

		if (prototype === object_prototype || prototype === array_prototype) {
			const proxy = new Proxy(value, state_proxy_handler);

			define_property(value, STATE_SYMBOL, {
				value: /** @type {import('#client').ProxyMetadata} */ ({
					s: new Map(),
					v: source(0),
					a: is_array(value),
					i: immutable,
					p: proxy,
					t: value
				}),
				writable: true,
				enumerable: false
			});

			if (DEV) {
				// @ts-expect-error
				value[STATE_SYMBOL].parent = parent;

				if (prev) {
					// Reuse owners from previous state; necessary because reassignment is not guaranteed to have correct component context.
					// If no previous proxy exists we play it safe and assume ownerless state
					// @ts-expect-error
					const prev_owners = prev?.v?.[STATE_SYMBOL]?.owners;
					// @ts-expect-error
					value[STATE_SYMBOL].owners = prev_owners ? new Set(prev_owners) : null;
				} else {
					// @ts-expect-error
					value[STATE_SYMBOL].owners =
						parent === null
							? current_component_context !== null
								? new Set([current_component_context.function])
								: null
							: new Set();
				}
			}

			return proxy;
		}
	}

	return value;
}

/**
 * @template {import('#client').ProxyStateObject} T
 * @param {T} value
 * @param {Map<T, Record<string | symbol, any>>} already_unwrapped
 * @returns {Record<string | symbol, any>}
 */
function unwrap(value, already_unwrapped) {
	if (typeof value === 'object' && value != null && STATE_SYMBOL in value) {
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
			const keys = Reflect.ownKeys(value);
			const descriptors = get_descriptors(value);
			already_unwrapped.set(value, obj);

			for (const key of keys) {
				if (key === STATE_SYMBOL) continue;
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
export function snapshot(value) {
	return /** @type {T} */ (
		unwrap(/** @type {import('#client').ProxyStateObject} */ (value), new Map())
	);
}

/**
 * @param {import('#client').Source<number>} signal
 * @param {1 | -1} [d]
 */
function update_version(signal, d = 1) {
	set(signal, signal.v + d);
}

/** @type {ProxyHandler<import('#client').ProxyStateObject<any>>} */
const state_proxy_handler = {
	defineProperty(target, prop, descriptor) {
		if (descriptor.value) {
			/** @type {import('#client').ProxyMetadata} */
			const metadata = target[STATE_SYMBOL];

			const s = metadata.s.get(prop);
			if (s !== undefined) set(s, proxy(descriptor.value, metadata.i, metadata));
		}

		return Reflect.defineProperty(target, prop, descriptor);
	},

	deleteProperty(target, prop) {
		/** @type {import('#client').ProxyMetadata} */
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

		if (boolean) {
			update_version(metadata.v);
		}

		return boolean;
	},

	get(target, prop, receiver) {
		if (prop === STATE_SYMBOL) {
			return Reflect.get(target, STATE_SYMBOL);
		}

		/** @type {import('#client').ProxyMetadata} */
		const metadata = target[STATE_SYMBOL];
		let s = metadata.s.get(prop);

		// create a source, but only if it's an own property and not a prototype property
		if (s === undefined && (!(prop in target) || get_descriptor(target, prop)?.writable)) {
			s = (metadata.i ? source : mutable_source)(proxy(target[prop], metadata.i, metadata));
			metadata.s.set(prop, s);
		}

		if (s !== undefined) {
			const value = get(s);
			return value === UNINITIALIZED ? undefined : value;
		}

		return Reflect.get(target, prop, receiver);
	},

	getOwnPropertyDescriptor(target, prop) {
		const descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
		if (descriptor && 'value' in descriptor) {
			/** @type {import('#client').ProxyMetadata} */
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
		/** @type {import('#client').ProxyMetadata} */
		const metadata = target[STATE_SYMBOL];
		const has = Reflect.has(target, prop);

		let s = metadata.s.get(prop);
		if (
			s !== undefined ||
			(current_effect !== null && (!has || get_descriptor(target, prop)?.writable))
		) {
			if (s === undefined) {
				s = (metadata.i ? source : mutable_source)(
					has ? proxy(target[prop], metadata.i, metadata) : UNINITIALIZED
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

	set(target, prop, value, receiver) {
		/** @type {import('#client').ProxyMetadata} */
		const metadata = target[STATE_SYMBOL];
		let s = metadata.s.get(prop);
		// If we haven't yet created a source for this property, we need to ensure
		// we do so otherwise if we read it later, then the write won't be tracked and
		// the heuristics of effects will be different vs if we had read the proxied
		// object property before writing to that property.
		if (s === undefined) {
			// the read creates a signal
			untrack(() => receiver[prop]);
			s = metadata.s.get(prop);
		}
		if (s !== undefined) {
			set(s, proxy(value, metadata.i, metadata));
		}
		const is_array = metadata.a;
		const not_has = !(prop in target);

		if (DEV) {
			/** @type {import('#client').ProxyMetadata | undefined} */
			const prop_metadata = value?.[STATE_SYMBOL];
			if (prop_metadata && prop_metadata?.parent !== metadata) {
				widen_ownership(metadata, prop_metadata);
			}
			check_ownership(metadata);
		}

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
			update_version(metadata.v);
		}

		return true;
	},

	ownKeys(target) {
		/** @type {import('#client').ProxyMetadata} */
		const metadata = target[STATE_SYMBOL];

		get(metadata.v);
		return Reflect.ownKeys(target);
	}
};

if (DEV) {
	state_proxy_handler.setPrototypeOf = () => {
		e.state_prototype_fixed();
	};
}

/**
 * @param {any} value
 */
export function get_proxied_value(value) {
	if (value !== null && typeof value === 'object' && STATE_SYMBOL in value) {
		var metadata = value[STATE_SYMBOL];
		if (metadata) {
			return metadata.p;
		}
	}
	return value;
}

/**
 * @param {any} a
 * @param {any} b
 */
export function is(a, b) {
	return Object.is(get_proxied_value(a), get_proxied_value(b));
}

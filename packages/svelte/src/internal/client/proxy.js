/** @import { ProxyMetadata, ProxyStateObject, Source } from '#client' */
import { DEV } from 'esm-env';
import { get, current_component_context, current_effect } from './runtime.js';
import {
	array_prototype,
	define_property,
	get_descriptor,
	get_prototype_of,
	is_array,
	is_frozen,
	object_prototype
} from '../shared/utils.js';
import { check_ownership, widen_ownership } from './dev/ownership.js';
import { source, set } from './reactivity/sources.js';
import { STATE_SYMBOL } from './constants.js';
import { UNINITIALIZED } from '../../constants.js';
import * as e from './errors.js';

/**
 * @param {string | symbol} prop
 */
function is_prop_positive_integer(prop) {
	// @ts-ignore
	return typeof prop === 'string' && prop >>> 0 === parseFloat(prop);
}

/**
 * @template T
 * @param {T} value
 * @param {ProxyMetadata | null} [parent]
 * @param {Source<T>} [prev] dev mode only
 * @returns {ProxyStateObject<T> | T}
 */
export function proxy(value, parent = null, prev) {
	if (typeof value === 'object' && value != null && !is_frozen(value)) {
		// If we have an existing proxy, return it...
		if (STATE_SYMBOL in value) {
			const metadata = /** @type {ProxyMetadata<T>} */ (value[STATE_SYMBOL]);

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
				value: /** @type {ProxyMetadata} */ ({
					s: new Map(),
					v: source(0),
					a: is_array(value),
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
 * @param {Source<number>} signal
 * @param {1 | -1} [d]
 */
function update_version(signal, d = 1) {
	set(signal, signal.v + d);
}

/** @type {ProxyHandler<ProxyStateObject<any>>} */
const state_proxy_handler = {
	// TODO needs fixing for non mutations
	defineProperty(target, prop, descriptor) {
		if (descriptor.value) {
			/** @type {ProxyMetadata} */
			const metadata = target[STATE_SYMBOL];

			const s = metadata.s.get(prop);
			if (s !== undefined) set(s, proxy(descriptor.value, metadata));
		}

		return Reflect.defineProperty(target, prop, descriptor);
	},

	deleteProperty(target, prop) {
		/** @type {ProxyMetadata} */
		const metadata = target[STATE_SYMBOL];
		const s = metadata.s.get(prop);
		const exists = s !== undefined ? s.v !== UNINITIALIZED : prop in target;

		if (s !== undefined) {
			set(s, UNINITIALIZED);
		}

		if (exists) {
			update_version(metadata.v);
		}

		return exists;
	},

	get(target, prop, receiver) {
		if (prop === STATE_SYMBOL) {
			return Reflect.get(target, STATE_SYMBOL);
		}

		/** @type {ProxyMetadata} */
		const metadata = target[STATE_SYMBOL];
		let s = metadata.s.get(prop);
		var exists = prop in target;

		// create a source, but only if it's an own property and not a prototype property
		if (s === undefined && (!exists || get_descriptor(target, prop)?.writable)) {
			s = source(proxy(exists ? target[prop] : UNINITIALIZED, metadata));
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
		/** @type {ProxyMetadata} */
		const metadata = target[STATE_SYMBOL];

		if (descriptor && 'value' in descriptor) {
			const s = metadata.s.get(prop);

			if (s) {
				descriptor.value = get(s);
			}
		} else if (descriptor === undefined) {
			var source = metadata.s.get(prop);
			var value = source?.v;

			if (source !== undefined && value !== UNINITIALIZED) {
				return {
					enumerable: true,
					configurable: true,
					value,
					writable: true
				};
			}
		}

		return descriptor;
	},

	has(target, prop) {
		if (prop === STATE_SYMBOL) {
			return true;
		}
		/** @type {ProxyMetadata} */
		const metadata = target[STATE_SYMBOL];
		let s = metadata.s.get(prop);
		const has = (s !== undefined && s.v !== UNINITIALIZED) || Reflect.has(target, prop);

		if (
			s !== undefined ||
			(current_effect !== null && (!has || get_descriptor(target, prop)?.writable))
		) {
			if (s === undefined) {
				s = source(has ? proxy(target[prop], metadata) : UNINITIALIZED);
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
		/** @type {ProxyMetadata} */
		const metadata = target[STATE_SYMBOL];
		let s = metadata.s.get(prop);
		let not_has = !(prop in target);
		// If we haven't yet created a source for this property, we need to ensure
		// we do so otherwise if we read it later, then the write won't be tracked and
		// the heuristics of effects will be different vs if we had read the proxied
		// object property before writing to that property.
		if (s === undefined) {
			if (!(prop in target) || get_descriptor(target, prop)?.writable) {
				s = source(undefined);
				set(s, proxy(value, metadata));
				metadata.s.set(prop, s);
			}
		} else {
			not_has = s.v === UNINITIALIZED;
			set(s, proxy(value, metadata));
		}
		const is_array = metadata.a;

		if (DEV) {
			/** @type {ProxyMetadata | undefined} */
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

		var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);

		// Set the new value before updating any signals so that any listeners get the new value
		if (descriptor?.set) {
			descriptor.set.call(receiver, value);
		}

		if (not_has) {
			// If we have mutated an array directly, we might need to
			// signal that length has also changed. Do it before updating metadata
			// to ensure that iterating over the array as a result of a metadata update
			// will not cause the length to be out of sync.
			if (is_array) {
				var ls = metadata.s.get('length');
				var prop_number = Number(prop);

				if (ls !== undefined && is_prop_positive_integer(prop) && prop_number >= ls.v) {
					set(ls, prop_number + 1);
				}
			}
			update_version(metadata.v);
		}

		return true;
	},

	ownKeys(target) {
		/** @type {ProxyMetadata} */
		var metadata = target[STATE_SYMBOL];

		get(metadata.v);

		var own_keys = Reflect.ownKeys(target).filter((key) => {
			var source = metadata.s.get(key);
			return source === undefined || source.v !== UNINITIALIZED;
		});

		for (var [key, source] of metadata.s) {
			if (source.v !== UNINITIALIZED && !(key in target)) {
				own_keys.push(key);
			}
		}

		return own_keys;
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

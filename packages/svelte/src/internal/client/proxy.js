/** @import { ProxyMetadata, ProxyStateObject, Source } from '#client' */
import { DEV } from 'esm-env';
import { get, current_component_context, untrack, current_effect } from './runtime.js';
import {
	array_prototype,
	get_descriptor,
	get_prototype_of,
	is_array,
	is_frozen,
	object_prototype
} from '../shared/utils.js';
import { check_ownership, widen_ownership } from './dev/ownership.js';
import { source, set } from './reactivity/sources.js';
import { STATE_SYMBOL, STATE_SYMBOL_METADATA } from './constants.js';
import { UNINITIALIZED } from '../../constants.js';
import * as e from './errors.js';

/**
 * @template T
 * @param {T} value
 * @param {ProxyMetadata | null} [parent]
 * @param {Source<T>} [prev] dev mode only
 * @returns {ProxyStateObject<T> | T}
 */
export function proxy(value, parent = null, prev) {
	// if non-proxyable, or is already a proxy, return `value`
	if (typeof value !== 'object' || value === null || is_frozen(value) || STATE_SYMBOL in value) {
		return value;
	}

	const prototype = get_prototype_of(value);

	if (prototype !== object_prototype && prototype !== array_prototype) {
		return value;
	}

	var sources = new Map();
	var is_proxied_array = is_array(value);
	var version = source(0);

	/** @type {ProxyMetadata} */
	var metadata;

	if (DEV) {
		metadata = {
			parent,
			owners: null
		};

		if (prev) {
			// Reuse owners from previous state; necessary because reassignment is not guaranteed to have correct component context.
			// If no previous proxy exists we play it safe and assume ownerless state
			// @ts-expect-error
			const prev_owners = prev.v?.[STATE_SYMBOL_METADATA]?.owners;
			metadata.owners = prev_owners ? new Set(prev_owners) : null;
		} else {
			metadata.owners =
				parent === null
					? current_component_context !== null
						? new Set([current_component_context.function])
						: null
					: new Set();
		}
	}

	return new Proxy(/** @type {any} */ (value), {
		defineProperty(target, prop, descriptor) {
			if (descriptor.value) {
				const s = sources.get(prop);
				if (s !== undefined) set(s, proxy(descriptor.value, metadata));
			}

			return Reflect.defineProperty(target, prop, descriptor);
		},

		deleteProperty(target, prop) {
			const s = sources.get(prop);
			const boolean = delete target[prop];

			// If we have mutated an array directly, and the deletion
			// was successful we will also need to update the length
			// before updating the field or the version. This is to
			// ensure any effects observing length can execute before
			// effects that listen to the fields – otherwise they will
			// operate an an index that no longer exists.
			if (is_proxied_array && boolean) {
				const ls = sources.get('length');
				const length = target.length - 1;
				if (ls !== undefined && ls.v !== length) {
					set(ls, length);
				}
			}

			if (s !== undefined) set(s, UNINITIALIZED);

			if (boolean) {
				update_version(version);
			}

			return boolean;
		},

		get(target, prop, receiver) {
			if (DEV && prop === STATE_SYMBOL_METADATA) {
				return metadata;
			}

			if (prop === STATE_SYMBOL) {
				return value;
			}

			let s = sources.get(prop);

			// create a source, but only if it's an own property and not a prototype property
			if (s === undefined && (!(prop in target) || get_descriptor(target, prop)?.writable)) {
				s = source(proxy(target[prop], metadata));
				sources.set(prop, s);
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
				const s = sources.get(prop);

				if (s) {
					descriptor.value = get(s);
				}
			}

			return descriptor;
		},

		has(target, prop) {
			if (DEV && prop === STATE_SYMBOL_METADATA) {
				return true;
			}

			if (prop === STATE_SYMBOL) {
				return true;
			}

			const has = Reflect.has(target, prop);

			let s = sources.get(prop);
			if (
				s !== undefined ||
				(current_effect !== null && (!has || get_descriptor(target, prop)?.writable))
			) {
				if (s === undefined) {
					s = source(has ? proxy(target[prop], metadata) : UNINITIALIZED);
					sources.set(prop, s);
				}
				const value = get(s);
				if (value === UNINITIALIZED) {
					return false;
				}
			}
			return has;
		},

		set(target, prop, value, receiver) {
			let s = sources.get(prop);
			// If we haven't yet created a source for this property, we need to ensure
			// we do so otherwise if we read it later, then the write won't be tracked and
			// the heuristics of effects will be different vs if we had read the proxied
			// object property before writing to that property.
			if (s === undefined) {
				// the read creates a signal
				untrack(() => receiver[prop]);
				s = sources.get(prop);
			}

			if (s !== undefined) {
				set(s, proxy(value, metadata));
			}

			const not_has = !(prop in target);

			if (DEV) {
				/** @type {ProxyMetadata | undefined} */
				const prop_metadata = value?.[STATE_SYMBOL_METADATA];
				if (prop_metadata && prop_metadata?.parent !== metadata) {
					widen_ownership(metadata, prop_metadata);
				}
				check_ownership(metadata);
			}

			// variable.length = value -> clear all signals with index >= value
			if (is_proxied_array && prop === 'length') {
				for (let i = value; i < target.length; i += 1) {
					const s = sources.get(i + '');
					if (s !== undefined) set(s, UNINITIALIZED);
				}
			}

			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);

			// Set the new value before updating any signals so that any listeners get the new value
			if (descriptor?.set) {
				descriptor.set.call(receiver, value);
			} else {
				target[prop] = value;
			}

			if (not_has) {
				// If we have mutated an array directly, we might need to
				// signal that length has also changed. Do it before updating the version
				// to ensure that iterating over the array as a result of a version update
				// will not cause the length to be out of sync.
				if (is_proxied_array) {
					const ls = sources.get('length');
					const length = target.length;
					if (ls !== undefined && ls.v !== length) {
						set(ls, length);
					}
				}
				update_version(version);
			}

			return true;
		},

		ownKeys(target) {
			get(version);
			return Reflect.ownKeys(target);
		},

		setPrototypeOf() {
			e.state_prototype_fixed();
		}
	});
}

/**
 * @param {Source<number>} signal
 * @param {1 | -1} [d]
 */
function update_version(signal, d = 1) {
	set(signal, signal.v + d);
}

/**
 * @param {any} value
 */
export function get_proxied_value(value) {
	if (value !== null && typeof value === 'object' && STATE_SYMBOL in value) {
		return value[STATE_SYMBOL];
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

/** @import { ProxyMetadata, Source } from '#client' */
import { DEV } from 'esm-env';
import { get, active_effect, active_reaction, set_active_reaction } from './runtime.js';
import { component_context } from './context.js';
import {
	array_prototype,
	get_descriptor,
	get_prototype_of,
	is_array,
	object_prototype
} from '../shared/utils.js';
import { check_ownership, widen_ownership } from './dev/ownership.js';
import { state as source, set } from './reactivity/sources.js';
import { STATE_SYMBOL, STATE_SYMBOL_METADATA } from './constants.js';
import { UNINITIALIZED } from '../../constants.js';
import * as e from './errors.js';
import { get_stack } from './dev/tracing.js';
import { tracing_mode_flag } from '../flags/index.js';

/** @type {ProxyMetadata | null} */
var parent_metadata = null;

/**
 * @template T
 * @param {T} value
 * @param {Source<T>} [prev] dev mode only
 * @returns {T}
 */
export function proxy(value, prev) {
	// if non-proxyable, or is already a proxy, return `value`
	if (typeof value !== 'object' || value === null || STATE_SYMBOL in value) {
		return value;
	}

	const prototype = get_prototype_of(value);

	if (prototype !== object_prototype && prototype !== array_prototype) {
		return value;
	}

	/** @type {Map<any, Source<any>>} */
	var sources = new Map();
	var is_proxied_array = is_array(value);
	var version = source(0);

	var stack = DEV && tracing_mode_flag ? get_stack('CreatedAt') : null;
	var reaction = active_reaction;

	/**
	 * @template T
	 * @param {() => T} fn
	 */
	var with_parent = (fn) => {
		var previous_reaction = active_reaction;
		set_active_reaction(reaction);

		/** @type {T} */
		var result;

		if (DEV) {
			var previous_metadata = parent_metadata;
			parent_metadata = metadata;
			result = fn();
			parent_metadata = previous_metadata;
		} else {
			result = fn();
		}

		set_active_reaction(previous_reaction);
		return result;
	};

	if (is_proxied_array) {
		// We need to create the length source eagerly to ensure that
		// mutations to the array are properly synced with our proxy
		sources.set('length', source(/** @type {any[]} */ (value).length, stack));
	}

	/** @type {ProxyMetadata} */
	var metadata;

	if (DEV) {
		metadata = {
			parent: parent_metadata,
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
				parent_metadata === null
					? component_context !== null
						? new Set([component_context.function])
						: null
					: new Set();
		}
	}

	return new Proxy(/** @type {any} */ (value), {
		defineProperty(_, prop, descriptor) {
			if (
				!('value' in descriptor) ||
				descriptor.configurable === false ||
				descriptor.enumerable === false ||
				descriptor.writable === false
			) {
				// we disallow non-basic descriptors, because unless they are applied to the
				// target object — which we avoid, so that state can be forked — we will run
				// afoul of the various invariants
				// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/getOwnPropertyDescriptor#invariants
				e.state_descriptors_fixed();
			}

			var s = sources.get(prop);

			if (s === undefined) {
				s = with_parent(() => source(descriptor.value, stack));
				sources.set(prop, s);
			} else {
				set(
					s,
					with_parent(() => proxy(descriptor.value))
				);
			}

			return true;
		},

		deleteProperty(target, prop) {
			var s = sources.get(prop);

			if (s === undefined) {
				if (prop in target) {
					sources.set(
						prop,
						with_parent(() => source(UNINITIALIZED, stack))
					);
				}
			} else {
				// When working with arrays, we need to also ensure we update the length when removing
				// an indexed property
				if (is_proxied_array && typeof prop === 'string') {
					var ls = /** @type {Source<number>} */ (sources.get('length'));
					var n = Number(prop);

					if (Number.isInteger(n) && n < ls.v) {
						set(ls, n);
					}
				}
				set(s, UNINITIALIZED);
				update_version(version);
			}

			return true;
		},

		get(target, prop, receiver) {
			if (DEV && prop === STATE_SYMBOL_METADATA) {
				return metadata;
			}

			if (prop === STATE_SYMBOL) {
				return value;
			}

			var s = sources.get(prop);
			var exists = prop in target;

			// create a source, but only if it's an own property and not a prototype property
			if (s === undefined && (!exists || get_descriptor(target, prop)?.writable)) {
				s = with_parent(() => source(proxy(exists ? target[prop] : UNINITIALIZED), stack));
				sources.set(prop, s);
			}

			if (s !== undefined) {
				var v = get(s);

				// In case of something like `foo = bar.map(...)`, foo would have ownership
				// of the array itself, while the individual items would have ownership
				// of the component that created bar. That means if we later do `foo[0].baz = 42`,
				// we could get a false-positive ownership violation, since the two proxies
				// are not connected to each other via the parent metadata relationship.
				// For this reason, we need to widen the ownership of the children
				// upon access when we detect they are not connected.
				if (DEV) {
					/** @type {ProxyMetadata | undefined} */
					var prop_metadata = v?.[STATE_SYMBOL_METADATA];
					if (prop_metadata && prop_metadata?.parent !== metadata) {
						widen_ownership(metadata, prop_metadata);
					}
				}

				return v === UNINITIALIZED ? undefined : v;
			}

			return Reflect.get(target, prop, receiver);
		},

		getOwnPropertyDescriptor(target, prop) {
			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);

			if (descriptor && 'value' in descriptor) {
				var s = sources.get(prop);
				if (s) descriptor.value = get(s);
			} else if (descriptor === undefined) {
				var source = sources.get(prop);
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
			if (DEV && prop === STATE_SYMBOL_METADATA) {
				return true;
			}

			if (prop === STATE_SYMBOL) {
				return true;
			}

			var s = sources.get(prop);
			var has = (s !== undefined && s.v !== UNINITIALIZED) || Reflect.has(target, prop);

			if (
				s !== undefined ||
				(active_effect !== null && (!has || get_descriptor(target, prop)?.writable))
			) {
				if (s === undefined) {
					s = with_parent(() => source(has ? proxy(target[prop]) : UNINITIALIZED, stack));
					sources.set(prop, s);
				}

				var value = get(s);
				if (value === UNINITIALIZED) {
					return false;
				}
			}

			return has;
		},

		set(target, prop, value, receiver) {
			var s = sources.get(prop);
			var has = prop in target;

			// variable.length = value -> clear all signals with index >= value
			if (is_proxied_array && prop === 'length') {
				for (var i = value; i < /** @type {Source<number>} */ (s).v; i += 1) {
					var other_s = sources.get(i + '');
					if (other_s !== undefined) {
						set(other_s, UNINITIALIZED);
					} else if (i in target) {
						// If the item exists in the original, we need to create a uninitialized source,
						// else a later read of the property would result in a source being created with
						// the value of the original item at that index.
						other_s = with_parent(() => source(UNINITIALIZED, stack));
						sources.set(i + '', other_s);
					}
				}
			}

			// If we haven't yet created a source for this property, we need to ensure
			// we do so otherwise if we read it later, then the write won't be tracked and
			// the heuristics of effects will be different vs if we had read the proxied
			// object property before writing to that property.
			if (s === undefined) {
				if (!has || get_descriptor(target, prop)?.writable) {
					s = with_parent(() => source(undefined, stack));
					set(
						s,
						with_parent(() => proxy(value))
					);
					sources.set(prop, s);
				}
			} else {
				has = s.v !== UNINITIALIZED;
				set(
					s,
					with_parent(() => proxy(value))
				);
			}

			if (DEV) {
				/** @type {ProxyMetadata | undefined} */
				var prop_metadata = value?.[STATE_SYMBOL_METADATA];
				if (prop_metadata && prop_metadata?.parent !== metadata) {
					widen_ownership(metadata, prop_metadata);
				}
				check_ownership(metadata);
			}

			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);

			// Set the new value before updating any signals so that any listeners get the new value
			if (descriptor?.set) {
				descriptor.set.call(receiver, value);
			}

			if (!has) {
				// If we have mutated an array directly, we might need to
				// signal that length has also changed. Do it before updating metadata
				// to ensure that iterating over the array as a result of a metadata update
				// will not cause the length to be out of sync.
				if (is_proxied_array && typeof prop === 'string') {
					var ls = /** @type {Source<number>} */ (sources.get('length'));
					var n = Number(prop);

					if (Number.isInteger(n) && n >= ls.v) {
						set(ls, n + 1);
					}
				}

				update_version(version);
			}

			return true;
		},

		ownKeys(target) {
			get(version);

			var own_keys = Reflect.ownKeys(target).filter((key) => {
				var source = sources.get(key);
				return source === undefined || source.v !== UNINITIALIZED;
			});

			for (var [key, source] of sources) {
				if (source.v !== UNINITIALIZED && !(key in target)) {
					own_keys.push(key);
				}
			}

			return own_keys;
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
	try {
		if (value !== null && typeof value === 'object' && STATE_SYMBOL in value) {
			return value[STATE_SYMBOL];
		}
	} catch {
		// the above if check can throw an error if the value in question
		// is the contentWindow of an iframe on another domain, in which
		// case we want to just return the value (because it's definitely
		// not a proxied value) so we don't break any JavaScript interacting
		// with that iframe (such as various payment companies client side
		// JavaScript libraries interacting with their iframes on the same
		// domain)
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

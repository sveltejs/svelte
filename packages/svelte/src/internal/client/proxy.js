/** @import { ProxyMetadata, Source, ValueOptions } from '#client' */
import { DEV } from 'esm-env';
import { UNINITIALIZED } from '../../constants.js';
import { tracing_mode_flag } from '../flags/index.js';
import { component_context } from './context.js';
import {
	array_prototype,
	get_descriptor,
	get_prototype_of,
	is_array,
	object_prototype
} from '../shared/utils.js';
import { PROXY_ONCHANGE_SYMBOL, STATE_SYMBOL, STATE_SYMBOL_METADATA } from './constants.js';
import { check_ownership, widen_ownership } from './dev/ownership.js';
import { get_stack } from './dev/tracing.js';
import * as e from './errors.js';
import { batch_onchange, set, source, state } from './reactivity/sources.js';
import { active_effect, get } from './runtime.js';

const array_methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];

/**
 * Used to prevent batching in case we are not setting the length of an array
 * @param {any} fn
 * @returns
 */
function identity(fn) {
	return fn;
}

/**
 * @param {ValueOptions | undefined} options
 * @returns {ValueOptions | undefined}
 */
function clone_options(options) {
	return options != null
		? {
				onchange: options.onchange
			}
		: undefined;
}

/**
 * @template T
 * @param {T} value
 * @param {ValueOptions} [_options]
 * @param {ProxyMetadata | null} [parent]
 * @param {Source<T>} [prev] dev mode only
 * @returns {T}
 */
export function proxy(value, _options, parent = null, prev) {
	// if non-proxyable, or is already a proxy, return `value`
	if (typeof value !== 'object' || value === null) {
		return value;
	}

	var options = clone_options(_options);

	if (STATE_SYMBOL in value) {
		// @ts-ignore
		value[PROXY_ONCHANGE_SYMBOL](options?.onchange);
		return value;
	}

	if (options?.onchange) {
		// if there's an onchange we actually store that but override the value
		// to store every other onchange that new proxies might add
		var onchanges = new Set([options.onchange]);
		options.onchange = () => {
			for (let onchange of onchanges) {
				onchange();
			}
		};
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

	if (is_proxied_array) {
		// We need to create the length source eagerly to ensure that
		// mutations to the array are properly synced with our proxy
		sources.set(
			'length',
			source(/** @type {any[]} */ (value).length, clone_options(options), stack)
		);
	}

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
				s = source(descriptor.value, clone_options(options), stack);
				sources.set(prop, s);
			} else {
				set(s, proxy(descriptor.value, options, metadata));
			}

			return true;
		},

		deleteProperty(target, prop) {
			var s = sources.get(prop);

			if (s === undefined) {
				if (prop in target) {
					sources.set(prop, source(UNINITIALIZED, clone_options(options), stack));
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
				// when we delete a property if the source is a proxy we remove the current onchange from
				// the proxy `onchanges` so that it doesn't trigger it anymore
				if (typeof s.v === 'object' && s.v !== null && STATE_SYMBOL in s.v) {
					s.v[PROXY_ONCHANGE_SYMBOL](options?.onchange, true);
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

			if (prop === PROXY_ONCHANGE_SYMBOL) {
				return (
					/** @type {(() => unknown) | undefined} */ value,
					/** @type {boolean} */ remove
				) => {
					// we either add or remove the passed in value
					// to the onchanges array or we set every source onchange
					// to the passed in value (if it's undefined it will make the chain stop)
					if (options?.onchange != null && value && !remove) {
						onchanges?.add?.(value);
					} else if (options?.onchange != null && value) {
						onchanges?.delete?.(value);
					} else {
						options = {
							onchange: value
						};
						for (let [, s] of sources) {
							if (s.o) {
								s.o.onchange = value;
							}
						}
					}
				};
			}

			var s = sources.get(prop);
			var exists = prop in target;

			// create a source, but only if it's an own property and not a prototype property
			if (s === undefined && (!exists || get_descriptor(target, prop)?.writable)) {
				let opt = clone_options(options);
				s = source(proxy(exists ? target[prop] : UNINITIALIZED, opt, metadata), opt, stack);
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

			v = Reflect.get(target, prop, receiver);

			if (
				is_proxied_array &&
				options?.onchange != null &&
				array_methods.includes(/** @type {string} */ (prop))
			) {
				return batch_onchange(v);
			}

			return v;
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
					let opt = clone_options(options);
					s = source(has ? proxy(target[prop], opt, metadata) : UNINITIALIZED, opt, stack);
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

			// if we are changing the length of the array we batch all the changes
			// to the sources and the original value by calling batch_onchange and immediately
			// invoking it...otherwise we just invoke an identity function
			(is_proxied_array && prop === 'length' ? batch_onchange : identity)(() => {
				// variable.length = value -> clear all signals with index >= value
				if (is_proxied_array && prop === 'length') {
					for (var i = value; i < /** @type {Source<number>} */ (s).v; i += 1) {
						var other_s = sources.get(i + '');
						if (other_s !== undefined) {
							if (
								typeof other_s.v === 'object' &&
								other_s.v !== null &&
								STATE_SYMBOL in other_s.v
							) {
								other_s.v[PROXY_ONCHANGE_SYMBOL](options?.onchange, true);
							}
							set(other_s, UNINITIALIZED);
						} else if (i in target) {
							// If the item exists in the original, we need to create a uninitialized source,
							// else a later read of the property would result in a source being created with
							// the value of the original item at that index.
							other_s = source(UNINITIALIZED, clone_options(options), stack);
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
						const opt = clone_options(options);
						s = source(undefined, opt, stack);
						set(s, proxy(value, opt, metadata));
						sources.set(prop, s);
					}
				} else {
					has = s.v !== UNINITIALIZED;
					// when we set a property if the source is a proxy we remove the current onchange from
					// the proxy `onchanges` so that it doesn't trigger it anymore
					if (typeof s.v === 'object' && s.v !== null && STATE_SYMBOL in s.v) {
						s.v[PROXY_ONCHANGE_SYMBOL](options?.onchange, true);
					}
					set(s, proxy(value, clone_options(options), metadata));
				}
			})();
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
 * @template T
 * @param {T} value
 * @param {ValueOptions} [options]
 * @returns {Source<T>}
 */

export function assignable_proxy(value, options) {
	return state(proxy(value, options), options);
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

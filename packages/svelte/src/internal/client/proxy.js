/** @import { Source } from '#client' */
import { DEV } from 'esm-env';
import { get, active_effect, active_reaction, set_active_reaction } from './runtime.js';
import {
	array_prototype,
	get_descriptor,
	get_prototype_of,
	is_array,
	object_prototype
} from '../shared/utils.js';
import { state as source, set } from './reactivity/sources.js';
import {
	PROXY_CHANGE_PATH,
	PROXY_PATH_SYMBOL,
	PROXY_PRESERVE_PATH,
	PROXY_REMOVE_PATH,
	STATE_SYMBOL
} from '#client/constants';
import { UNINITIALIZED } from '../../constants.js';
import * as e from './errors.js';
import { get_stack, tag } from './dev/tracing.js';
import { tracing_mode_flag } from '../flags/index.js';

/**
 * @template T
 * @param {T} value
 * @param {string} [path]
 * @param {number} [path_preservation]
 * @returns {T}
 */
export function proxy(value, path, path_preservation = PROXY_PRESERVE_PATH) {
	// if `DEV`, change the proxy `path` since we don't know if its still "owned" by its original source
	if (
		DEV &&
		(path_preservation & PROXY_PRESERVE_PATH) === 0 &&
		typeof value === 'object' &&
		value !== null &&
		STATE_SYMBOL in value &&
		PROXY_PATH_SYMBOL in value
	) {
		value[PROXY_PATH_SYMBOL] =
			(path_preservation & PROXY_CHANGE_PATH) === 0 ? '[$state proxy]' : path;
	}
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
	var version = tag(source(0), `${path} version`);

	var stack = DEV && tracing_mode_flag ? get_stack('CreatedAt') : null;
	var reaction = active_reaction;
	/** @type {(prop: any) => any} */
	var to_trace_name = DEV
		? (prop) => {
				return typeof prop === 'symbol'
					? `${path}[Symbol(${prop.description ?? ''})]`
					: typeof prop === 'number' || Number(prop) === Number(prop)
						? `${path}[${prop}]`
						: `${path}.${prop}`;
			}
		: (prop) => undefined;

	/**
	 * @template T
	 * @param {() => T} fn
	 */
	var with_parent = (fn) => {
		var previous_reaction = active_reaction;
		set_active_reaction(reaction);

		/** @type {T} */
		var result = fn();

		set_active_reaction(previous_reaction);
		return result;
	};

	if (is_proxied_array) {
		// We need to create the length source eagerly to ensure that
		// mutations to the array are properly synced with our proxy
		const length_source = source(/** @type {any[]} */ (value).length, stack);
		sources.set('length', DEV ? tag(length_source, to_trace_name('length')) : length_source);
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
				s = DEV && typeof prop === 'string' ? tag(s, to_trace_name(prop)) : s;
				sources.set(prop, s);
			} else {
				set(
					s,
					with_parent(() => proxy(descriptor.value, to_trace_name(prop)))
				);
			}

			return true;
		},

		deleteProperty(target, prop) {
			var s = sources.get(prop);

			if (s === undefined) {
				if (prop in target) {
					const s = with_parent(() => source(UNINITIALIZED, stack));
					sources.set(prop, DEV ? tag(s, to_trace_name(prop)) : s);
					update_version(version);
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
			if (prop === STATE_SYMBOL) {
				return value;
			}
			if (DEV && prop === PROXY_PATH_SYMBOL) {
				return path;
			}

			var s = sources.get(prop);
			var exists = prop in target;

			// create a source, but only if it's an own property and not a prototype property
			if (s === undefined && (!exists || get_descriptor(target, prop)?.writable)) {
				s = with_parent(() =>
					source(proxy(exists ? target[prop] : UNINITIALIZED, to_trace_name(prop)), stack)
				);
				s = DEV ? tag(s, to_trace_name(prop)) : s;
				sources.set(prop, s);
			}

			if (s !== undefined) {
				var v = get(s);
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
			if (prop === STATE_SYMBOL || (DEV && prop === PROXY_PATH_SYMBOL)) {
				return true;
			}

			var s = sources.get(prop);
			var has = (s !== undefined && s.v !== UNINITIALIZED) || Reflect.has(target, prop);

			if (
				s !== undefined ||
				(active_effect !== null && (!has || get_descriptor(target, prop)?.writable))
			) {
				if (s === undefined) {
					s = with_parent(() =>
						source(has ? proxy(target[prop], to_trace_name(prop)) : UNINITIALIZED, stack)
					);
					s = DEV ? tag(s, to_trace_name(prop)) : s;
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
			if (DEV && prop === PROXY_PATH_SYMBOL) {
				path = value;
				// tag(version, `${path} version`);
				// rename all child sources and child proxies
				for (const [prop, source] of sources) {
					tag(source, to_trace_name(prop));
					if (typeof source.v === 'object' && source.v !== null && PROXY_PATH_SYMBOL in source.v) {
						source.v[PROXY_PATH_SYMBOL] = to_trace_name(prop);
					}
				}
			}
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
						other_s = DEV ? tag(other_s, to_trace_name(i)) : other_s;
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
					s = DEV ? tag(s, to_trace_name(prop)) : s;
					set(
						s,
						with_parent(() => proxy(value, to_trace_name(prop), PROXY_CHANGE_PATH))
					);
					sources.set(prop, s);
				}
			} else {
				has = s.v !== UNINITIALIZED;
				set(
					s,
					with_parent(() => proxy(value, to_trace_name(prop), PROXY_CHANGE_PATH))
				);
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

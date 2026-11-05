/** @import { Source } from '#client' */
import { DEV } from 'esm-env';
import {
	get,
	is_destroying_effect,
	active_effect,
	update_version,
	active_reaction,
	set_update_version,
	set_active_reaction
} from './runtime.js';
import {
	array_prototype,
	get_descriptor,
	get_prototype_of,
	is_array,
	is_extensible,
	object_prototype
} from '../shared/utils.js';
import {
	state as source,
	set,
	increment,
	flush_eager_effects,
	old_values,
	set_eager_effects_deferred
} from './reactivity/sources.js';
import { COMPONENT_SYMBOL, ORIGINAL, PROXY_PATH_SYMBOL, STATE_SYMBOL } from '#client/constants';
import { UNINITIALIZED } from '../../constants.js';
import * as e from './errors.js';
import { tag } from './dev/tracing.js';
import { get_error } from '../shared/dev.js';
import { tracing_mode_flag } from '../flags/index.js';
import { batch_values } from './reactivity/batch.js';

// TODO move all regexes into shared module?
const regex_is_valid_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

/**
 * The value a write compares against: the current batch's, which inside a fork isn't `source.v`
 * @template T
 * @param {Source<T>} source
 * @returns {T}
 */
function batch_value(source) {
	return batch_values?.has(source) ? batch_values.get(source) : source.v;
}

/**
 * What `get(source)` returns, without tracking it: a teardown sees the value from before the flush
 * @template T
 * @param {Source<T>} source
 * @returns {T}
 */
function observed_value(source) {
	return is_destroying_effect && old_values.has(source)
		? old_values.get(source)
		: batch_value(source);
}

/**
 * The value before a write that deletes a key the target owns, when the key has no source yet.
 * An accessor isn't called, so it stays deleted even if the fork that deleted it is discarded
 * @param {object} target
 * @param {string | symbol} prop
 */
function value_before_delete(target, prop) {
	return get_descriptor(target, prop)?.writable ? ORIGINAL : UNINITIALIZED;
}

/**
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function proxy(value) {
	// if non-proxyable, a component instance, or already a proxy, return `value`
	if (
		typeof value !== 'object' ||
		value === null ||
		STATE_SYMBOL in value ||
		COMPONENT_SYMBOL in value
	) {
		return value;
	}

	const prototype = get_prototype_of(value);

	if (prototype !== object_prototype && prototype !== array_prototype) {
		return value;
	}

	/** @type {Map<any, Source<any>>} */
	var sources = new Map();
	var version = source(0);
	/** @type {Source<number> | null} */
	var length_source = null;
	/** @type {Map<string | symbol, unknown> | null} the target's own values read through `ORIGINAL` */
	var originals = null;
	// where a key with no own value is looked up
	var inherited = prototype;

	var stack = DEV && tracing_mode_flag ? get_error('created at') : null;
	var parent_version = update_version;

	/**
	 * Executes the proxy in the context of the reaction it was originally created in, if any
	 * @template T
	 * @param {() => T} fn
	 */
	var with_parent = (fn) => {
		if (update_version === parent_version) {
			return fn();
		}

		// child source is being created after the initial proxy —
		// prevent it from being associated with the current reaction
		var reaction = active_reaction;
		var version = update_version;

		set_active_reaction(null);
		set_update_version(parent_version);

		var result = fn();

		set_active_reaction(reaction);
		set_update_version(version);

		return result;
	};

	/**
	 * Reads a key as the target has it. An own value is proxied once, so that it keeps its identity
	 * @param {object} target
	 * @param {string | symbol} prop
	 * @param {unknown} receiver
	 */
	var read_original = (target, prop, receiver) => {
		if (get_descriptor(target, prop) === undefined) return Reflect.get(target, prop, receiver);

		originals ??= new Map();
		var p = originals.get(prop);

		if (p === undefined) {
			p = with_parent(() => proxy(Reflect.get(target, prop)));
			originals.set(prop, p);
		}

		return p;
	};

	if (is_array(value)) {
		// We need to create the length source eagerly to ensure that
		// mutations to the array are properly synced with our proxy
		length_source = source(value.length, stack);
		sources.set('length', length_source);
		if (DEV) {
			value = /** @type {any} */ (inspectable_array(/** @type {any[]} */ (value)));
			// wrap the methods looked up through a source too, so that `$inspect` doesn't see an
			// array in the middle of a mutating method
			inherited = inspectable_array(array_prototype);
		}
	}

	/** Used in dev for $inspect.trace() */
	var path = '';
	let updating = false;
	/** @param {string} new_path */
	function update_path(new_path) {
		if (updating) return;
		updating = true;
		path = new_path;

		tag(version, `${path} version`);

		// rename all child sources and child proxies
		for (const [prop, source] of sources) {
			tag(source, get_label(path, prop));
		}
		updating = false;
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
				with_parent(() => {
					var s = source(descriptor.value, stack);
					sources.set(prop, s);
					if (DEV && typeof prop === 'string') {
						tag(s, get_label(path, prop));
					}
					return s;
				});
			} else {
				set(s, descriptor.value, true);
			}

			return true;
		},

		deleteProperty(target, prop) {
			var s = sources.get(prop);

			if (s === undefined) {
				if (prop in target) {
					const s = with_parent(() => source(value_before_delete(target, prop), stack));
					sources.set(prop, s);
					set(s, UNINITIALIZED);
					increment(version);

					if (DEV) {
						tag(s, get_label(path, prop));
					}
				}
			} else if (is_own(batch_value(s), target, prop)) {
				set(s, UNINITIALIZED);
				increment(version);
			}

			return true;
		},

		get(target, prop, receiver) {
			if (prop === STATE_SYMBOL) {
				return value;
			}

			if (DEV && prop === PROXY_PATH_SYMBOL) {
				return update_path;
			}

			var s = sources.get(prop);
			var exists = prop in target;

			// create a source, but only if it's an own property and not a prototype property
			if (s === undefined && (!exists || get_descriptor(target, prop)?.writable)) {
				s = with_parent(() => {
					var p = proxy(exists ? target[prop] : UNINITIALIZED);
					var s = source(p, stack);

					if (DEV) {
						tag(s, get_label(path, prop));
					}

					return s;
				});

				sources.set(prop, s);
			}

			if (s !== undefined) {
				var v = get(s);
				if (v === ORIGINAL) return read_original(target, prop, receiver);
				return v === UNINITIALIZED ? Reflect.get(inherited, prop, receiver) : v;
			}

			return Reflect.get(target, prop, receiver);
		},

		getOwnPropertyDescriptor(target, prop) {
			this.has?.(target, prop);

			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
			var s = sources.get(prop);

			// an inherited name gets a source too, so that `Object.hasOwn` sees an own key shadow it;
			// only a reaction can track it
			if (s === undefined && descriptor === undefined && active_reaction !== null) {
				s = with_parent(() => source(ORIGINAL, stack));
				sources.set(prop, s);

				if (DEV) {
					tag(s, get_label(path, prop));
				}
			}

			if (s !== undefined) {
				var value = get(s);

				if (value === UNINITIALIZED) {
					return undefined;
				}

				if (value === ORIGINAL) {
					// as on the target, where a value no one has read isn't proxied yet
					if (descriptor && originals?.has(prop)) descriptor.value = originals.get(prop);
					return descriptor;
				}

				if (descriptor && 'value' in descriptor) {
					descriptor.value = value;
				} else {
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

			var s = sources.get(prop);
			// without a source, the key is as the target has it
			var current = s === undefined ? ORIGINAL : observed_value(s);
			var has = current === ORIGINAL ? Reflect.has(target, prop) : current !== UNINITIALIZED;

			if (
				s !== undefined ||
				((active_effect !== null || active_reaction !== null) &&
					(!has || get_descriptor(target, prop)?.writable))
			) {
				if (s === undefined) {
					s = with_parent(() => {
						var p = has ? proxy(target[prop]) : UNINITIALIZED;
						var s = source(p, stack);

						if (DEV) {
							tag(s, get_label(path, prop));
						}

						return s;
					});

					sources.set(prop, s);
				}

				var value = get(s);
				if (value === UNINITIALIZED) {
					return Reflect.has(prototype, prop);
				}
			}

			return has;
		},

		set(target, prop, value, receiver) {
			var s = sources.get(prop);
			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
			var has = is_own(s === undefined ? ORIGINAL : batch_value(s), target, prop);

			if (!has && descriptor === undefined && prop in target && !is_shadowable(target, prop)) {
				// as on a plain object, assigning an inherited accessor (`__proto__`) or read-only
				// property, or any inherited name on a non-extensible object, adds no own property
				return true;
			}

			// variable.length = value -> clear all signals with index >= value
			if (length_source !== null && prop === 'length') {
				for (var i = value; i < batch_value(length_source); i += 1) {
					var other_s = sources.get(i + '');
					if (other_s !== undefined) {
						set(other_s, UNINITIALIZED);
					} else if (i in target) {
						// If the item exists in the original, we need to create a source for it,
						// else a later read of the property would result in a source being created with
						// the value of the original item at that index.
						other_s = with_parent(() => source(value_before_delete(target, i), stack));
						sources.set(i + '', other_s);
						set(other_s, UNINITIALIZED);

						if (DEV) {
							tag(other_s, get_label(path, i));
						}
					}
				}
			}

			// If we haven't yet created a source for this property, we need to ensure
			// we do so otherwise if we read it later, then the write won't be tracked and
			// the heuristics of effects will be different vs if we had read the proxied
			// object property before writing to that property.
			if (s === undefined) {
				if (!has || descriptor?.writable) {
					s = with_parent(() => source(ORIGINAL, stack));

					if (DEV) {
						tag(s, get_label(path, prop));
					}
					set(s, proxy(value));

					sources.set(prop, s);
				}
			} else {
				var p = with_parent(() => proxy(value));
				set(s, p);
			}

			// Set the new value before updating any signals so that any listeners get the new value
			if (descriptor?.set) {
				descriptor.set.call(receiver, value);
			}

			if (!has) {
				// If we have mutated an array directly, we might need to
				// signal that length has also changed. Do it before updating metadata
				// to ensure that iterating over the array as a result of a metadata update
				// will not cause the length to be out of sync.
				if (length_source !== null && typeof prop === 'string') {
					var n = Number(prop);

					if (Number.isInteger(n) && n >= batch_value(length_source)) {
						set(length_source, n + 1);
					}
				}

				increment(version);
			}

			return true;
		},

		ownKeys(target) {
			get(version);

			var own_keys = Reflect.ownKeys(target).filter((key) => {
				var source = sources.get(key);
				return source === undefined || observed_value(source) !== UNINITIALIZED;
			});

			for (var [key, source] of sources) {
				var current = observed_value(source);

				// a key that is as the target has it is in its keys already, or absent
				if (
					current !== UNINITIALIZED &&
					current !== ORIGINAL &&
					get_descriptor(target, key) === undefined
				) {
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
 * @param {string} path
 * @param {string | symbol} prop
 */
function get_label(path, prop) {
	if (typeof prop === 'symbol') return `${path}[Symbol(${prop.description ?? ''})]`;
	if (regex_is_valid_identifier.test(prop)) return `${path}.${prop}`;
	return /^\d+$/.test(prop) ? `${path}[${prop}]` : `${path}['${prop}']`;
}

/**
 * Whether the target owns a key, given the value of the key's source, where `ORIGINAL` leaves the
 * key as the target has it
 * @param {unknown} value
 * @param {object} target
 * @param {string | symbol} prop
 */
function is_own(value, target, prop) {
	return value === ORIGINAL ? get_descriptor(target, prop) !== undefined : value !== UNINITIALIZED;
}

/**
 * Whether assigning `prop`, which `object` inherits, adds an own property on a plain object
 * @param {object} object
 * @param {string | symbol} prop
 */
function is_shadowable(object, prop) {
	if (!is_extensible(object)) return false;

	for (var proto = get_prototype_of(object); proto !== null; proto = get_prototype_of(proto)) {
		var descriptor = get_descriptor(proto, prop);
		if (descriptor !== undefined) return descriptor.writable === true;
	}

	return true;
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

const ARRAY_MUTATING_METHODS = new Set([
	'copyWithin',
	'fill',
	'pop',
	'push',
	'reverse',
	'shift',
	'sort',
	'splice',
	'unshift'
]);

/**
 * Wrap array mutating methods so $inspect is triggered only once and
 * to prevent logging an array in intermediate state (e.g. with an empty slot)
 * @param {any[]} array
 */
function inspectable_array(array) {
	return new Proxy(array, {
		get(target, prop, receiver) {
			var value = Reflect.get(target, prop, receiver);
			if (!ARRAY_MUTATING_METHODS.has(/** @type {string} */ (prop))) {
				return value;
			}

			/**
			 * @this {any[]}
			 * @param {any[]} args
			 */
			return function (...args) {
				set_eager_effects_deferred();
				var result = value.apply(this, args);
				flush_eager_effects();
				return result;
			};
		}
	});
}

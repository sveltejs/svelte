import { DEV } from 'esm-env';
import {
	get,
	updating_derived,
	batch_inspect,
	current_component_context,
	untrack
} from './runtime.js';
import { effect_active } from './reactivity/effects.js';
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
import { add_owner, check_ownership, strip_owner } from './dev/ownership.js';
import { mutable_source, source, set } from './reactivity/sources.js';
import { STATE_SYMBOL, UNINITIALIZED } from './constants.js';

/**
 * @template T
 * @param {T} value
 * @param {boolean} [immutable]
 * @param {Set<Function> | null} [owners]
 * @returns {import('./types.js').ProxyStateObject<T> | T}
 */
export function proxy(value, immutable = true, owners) {
	if (typeof value === 'object' && value != null && !is_frozen(value)) {
		// If we have an existing proxy, return it...
		if (STATE_SYMBOL in value) {
			const metadata = /** @type {import('./types.js').ProxyMetadata<T>} */ (value[STATE_SYMBOL]);
			// ...unless the proxy belonged to a different object, because
			// someone copied the state symbol using `Reflect.ownKeys(...)`
			if (metadata.t === value || metadata.p === value) {
				if (DEV) {
					// update ownership
					if (owners) {
						for (const owner of owners) {
							add_owner(value, owner);
						}
					} else {
						strip_owner(value);
					}
				}

				return metadata.p;
			}
		}

		const prototype = get_prototype_of(value);

		// TODO handle Map and Set as well
		if (prototype === object_prototype || prototype === array_prototype) {
			const proxy = new Proxy(value, state_proxy_handler);

			define_property(value, STATE_SYMBOL, {
				value: /** @type {import('./types.js').ProxyMetadata} */ ({
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
				// set ownership — either of the parent proxy's owners (if provided) or,
				// when calling `$.proxy(...)`, to the current component if such there be
				// @ts-expect-error
				value[STATE_SYMBOL].o =
					owners === undefined
						? current_component_context
							? // @ts-expect-error
								new Set([current_component_context.function])
							: null
						: owners && new Set(owners);
			}

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
export function unstate(value) {
	return /** @type {T} */ (
		unwrap(/** @type {import('./types.js').ProxyStateObject} */ (value), new Map())
	);
}

/**
 * @param {import('./types.js').Source<number>} signal
 * @param {1 | -1} [d]
 */
function update_version(signal, d = 1) {
	const value = untrack(() => get(signal));
	set(signal, value + d);
}

/** @type {ProxyHandler<import('./types.js').ProxyStateObject<any>>} */
const state_proxy_handler = {
	defineProperty(target, prop, descriptor) {
		if (descriptor.value) {
			/** @type {import('./types.js').ProxyMetadata} */
			const metadata = target[STATE_SYMBOL];

			const s = metadata.s.get(prop);
			if (s !== undefined) set(s, proxy(descriptor.value, metadata.i, metadata.o));
		}

		return Reflect.defineProperty(target, prop, descriptor);
	},

	deleteProperty(target, prop) {
		/** @type {import('./types.js').ProxyMetadata} */
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

		/** @type {import('./types.js').ProxyMetadata} */
		const metadata = target[STATE_SYMBOL];
		let s = metadata.s.get(prop);

		// if we're reading a property in a reactive context, create a source,
		// but only if it's an own property and not a prototype property
		if (
			s === undefined &&
			(effect_active() || updating_derived) &&
			(!(prop in target) || get_descriptor(target, prop)?.writable)
		) {
			s = (metadata.i ? source : mutable_source)(proxy(target[prop], metadata.i, metadata.o));
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
			/** @type {import('./types.js').ProxyMetadata} */
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
		/** @type {import('./types.js').ProxyMetadata} */
		const metadata = target[STATE_SYMBOL];
		const has = Reflect.has(target, prop);

		let s = metadata.s.get(prop);
		if (s !== undefined || (effect_active() && (!has || get_descriptor(target, prop)?.writable))) {
			if (s === undefined) {
				s = (metadata.i ? source : mutable_source)(
					has ? proxy(target[prop], metadata.i, metadata.o) : UNINITIALIZED
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
		/** @type {import('./types.js').ProxyMetadata} */
		const metadata = target[STATE_SYMBOL];
		let s = metadata.s.get(prop);
		// If we haven't yet created a source for this property, we need to ensure
		// we do so otherwise if we read it later, then the write won't be tracked and
		// the heuristics of effects will be different vs if we had read the proxied
		// object property before writing to that property.
		if (s === undefined && effect_active()) {
			// the read creates a signal
			untrack(() => receiver[prop]);
			s = metadata.s.get(prop);
		}
		if (s !== undefined) {
			set(s, proxy(value, metadata.i, metadata.o));
		}
		const is_array = metadata.a;
		const not_has = !(prop in target);

		if (DEV) {
			// First check ownership of the object that is assigned to.
			// Then, if the new object has owners, widen them with the ones from the current object.
			// If it doesn't have owners that means it's ownerless, and so the assigned object should be, too.
			if (metadata.o) {
				check_ownership(metadata.o);
				for (const owner in metadata.o) {
					add_owner(value, owner);
				}
			} else {
				strip_owner(value);
			}
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
		/** @type {import('./types.js').ProxyMetadata} */
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

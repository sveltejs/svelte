import {
	effect_active,
	get,
	set,
	increment,
	source,
	updating_derived,
	UNINITIALIZED
} from './runtime.js';
import { get_descriptor, is_array } from './utils.js';

/** @typedef {{ s: Map<any, import('./types.js').SourceSignal<any>>; v: import('./types.js').SourceSignal<number>; a: boolean, b: Record<string | symbol, Function> }} Metadata */
/** @typedef {Record<string | symbol, any> & { [STATE_SYMBOL]: Metadata }} StateObject */
/**
 * @template T
 * @typedef {Set<T> & { [STATE_SYMBOL]: Metadata }} StateSet
 */

export const STATE_SYMBOL = Symbol();
export const STATE_SYMBOL_SET = Symbol();

const object_prototype = Object.prototype;
const array_prototype = Array.prototype;
const set_prototype = Set.prototype;

const get_prototype_of = Object.getPrototypeOf;
const is_frozen = Object.isFrozen;

/**
 * @template {StateObject} T
 * @param {T} value
 * @returns {T}
 */
export function proxy(value) {
	if (typeof value === 'object' && value != null && !is_frozen(value) && !(STATE_SYMBOL in value)) {
		const prototype = get_prototype_of(value);

		// TODO handle Map and Set as well
		if (
			prototype === object_prototype ||
			prototype === array_prototype ||
			prototype === set_prototype
		) {
			// @ts-expect-error
			value[STATE_SYMBOL] = init(prototype === array_prototype);

			const h = prototype === set_prototype ? set_handler : handler;

			// @ts-expect-error not sure how to fix this
			return new Proxy(value, h);
		}
	}

	return value;
}

/**
 * @param {boolean} is_array
 * @returns {Metadata}
 */
function init(is_array) {
	return {
		s: new Map(),
		v: source(0),
		a: is_array,
		b: {}
	};
}

const set_size = /** @type {Function} */ (
	/** @type {PropertyDescriptor} */ (get_descriptor(set_prototype, 'size')).get
);

/**
 * @template T
 * @type {Record<string | symbol, (this: StateSet<T>, ...args: any) => any>}
 */
const set_methods = {
	/** @type {(this: StateSet<T>) => Iterable<T>} this */
	[Symbol.iterator]() {
		const metadata = this[STATE_SYMBOL];
		get(metadata.v);
		return set_prototype[Symbol.iterator].call(this);
	},

	/** @type {(this: StateSet<T>, value: T) => void} value */
	add(value) {
		const metadata = this[STATE_SYMBOL];
		set_prototype.add.call(this, value);

		let s = metadata.s.get(/** @type {any} */ (value));
		if (s === undefined) {
			s = source(true);
			metadata.s.set(/** @type {any} */ (value), source(true));
		} else {
			set(s, true);
		}

		increment(metadata.v);
	},

	clear() {
		const metadata = this[STATE_SYMBOL];
		set_prototype.clear.call(this);

		for (const key of metadata.s.keys()) {
			let s = /** @type {import('./types.js').SourceSignal} */ (metadata.s.get(key));
			set(s, false);
		}

		increment(metadata.v);
	},

	/** @param {T} value */
	delete(value) {
		const metadata = this[STATE_SYMBOL];
		set_prototype.delete.call(this, value);

		let s = metadata.s.get(value);
		if (s === undefined) {
			s = source(true);
			metadata.s.set(value, source(false));
		} else {
			set(s, false);
		}

		increment(metadata.v);
	},

	/** @param {T} value */
	has(value) {
		const metadata = this[STATE_SYMBOL];

		let s = metadata.s.get(value);
		if (s === undefined) {
			s = source(set_prototype.has.call(this, value));
			metadata.s.set(value, s);
		}

		return get(s);
	},

	get size() {
		// @ts-expect-error
		const metadata = /** @type {Metadata} */ (this[STATE_SYMBOL]);

		get(metadata.v);
		return set_size.call(this);
	}
};

/**
 * @template T
 * @type {ProxyHandler<StateSet<T>>}
 */
const set_handler = {
	get(target, prop, receiver) {
		const metadata = target[STATE_SYMBOL];

		if (prop === 'size') {
			get(metadata.v);
			return Reflect.get(target, prop, target);
		}

		const method = set_methods[prop];
		if (method) {
			return (metadata.b[prop] ??= method.bind(target));
		}

		return Reflect.get(target, prop, receiver);
	}
};

/** @type {ProxyHandler<StateObject>} */
const handler = {
	get(target, prop, receiver) {
		const metadata = target[STATE_SYMBOL];
		let s = metadata.s.get(prop);

		// if we're reading a property in a reactive context, create a source,
		// but only if it's an own property and not a prototype property
		if (
			s === undefined &&
			(effect_active() || updating_derived) &&
			(!(prop in target) || get_descriptor(target, prop)?.writable)
		) {
			s = source(proxy(target[prop]));
			metadata.s.set(prop, s);
		}

		const value = s !== undefined ? get(s) : Reflect.get(target, prop, receiver);
		return value === UNINITIALIZED ? undefined : value;
	},
	set(target, prop, value) {
		const metadata = target[STATE_SYMBOL];

		const s = metadata.s.get(prop);
		if (s !== undefined) set(s, proxy(value));

		if (metadata.a && prop === 'length') {
			for (let i = value; i < target.length; i += 1) {
				const s = metadata.s.get(i + '');
				if (s !== undefined) set(s, UNINITIALIZED);
			}
		}

		if (!(prop in target)) increment(metadata.v);
		// @ts-ignore
		target[prop] = value;

		return true;
	},
	deleteProperty(target, prop) {
		const metadata = target[STATE_SYMBOL];

		const s = metadata.s.get(prop);
		if (s !== undefined) set(s, UNINITIALIZED);

		if (prop in target) increment(metadata.v);

		return delete target[prop];
	},
	has(target, prop) {
		if (prop === STATE_SYMBOL) {
			return true;
		}
		const metadata = target[STATE_SYMBOL];
		const has = Reflect.has(target, prop);
		let s = metadata.s.get(prop);
		if (s !== undefined || (effect_active() && (!has || get_descriptor(target, prop)?.writable))) {
			if (s === undefined) {
				s = source(has ? proxy(target[prop]) : UNINITIALIZED);
				metadata.s.set(prop, s);
			}
			const value = get(s);
			if (value === UNINITIALIZED) {
				return false;
			}
		}
		return has;
	},
	ownKeys(target) {
		const metadata = target[STATE_SYMBOL];

		get(metadata.v);
		return Reflect.ownKeys(target);
	}
};

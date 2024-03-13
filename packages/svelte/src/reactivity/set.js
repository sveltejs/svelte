import { DEV } from 'esm-env';
import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';

var read = [
	'difference',
	'forEach',
	'intersection',
	'isDisjointFrom',
	'isSubsetOf',
	'isSupersetOf',
	'symmetricDifference',
	'union'
];

/**
 * @template T
 * @param {IterableIterator<T>} iterator
 */
function make_iterable(iterator) {
	iterator[Symbol.iterator] = get_self;
	return iterator;
}

/**
 * @this {any}
 */
function get_self() {
	return this;
}

var inited = false;

/**
 * @template T
 */
export class ReactiveSet extends Set {
	/** @type {Set<T>} */
	#entries = new Set();
	#version = source(0);
	#size = source(0);

	/**
	 * @param {Iterable<T> | null | undefined} value
	 */
	constructor(value) {
		super();

		// If the value is invalid then the native exception will fire here
		if (DEV) new Set(value);

		if (value) {
			for (var element of value) {
				this.add(element);
			}
		}

		if (!inited) this.#init();
	}

	// We init as part of the first instance so that we can treeshake this class
	#init() {
		inited = true;

		var proto = ReactiveSet.prototype;
		var set_proto = Set.prototype;

		for (var method of read) {
			// @ts-ignore
			proto[method] = function (...v) {
				get(this.#version);
				// @ts-ignore
				return set_proto[method].apply(this, v);
			};
		}
	}

	#increment_version() {
		set(this.#version, this.#version.v + 1);
	}

	/** @param {T} value */
	has(value) {
		get(this.#version);
		return this.#entries.has(value);
	}

	/** @param {T} value */
	add(value) {
		var entries = this.#entries;

		if (!entries.has(value)) {
			entries.add(value);
			set(this.#size, entries.size);
			this.#increment_version();
		}

		return super.add(value);
	}

	/** @param {T} value */
	delete(value) {
		var entries = this.#entries;

		if (entries.has(value)) {
			entries.delete(value);
			set(this.#size, entries.size);
			this.#increment_version();
		}

		return super.delete(value);
	}

	clear() {
		var entries = this.#entries;

		if (entries.size !== 0) {
			set(this.#size, 0);
			this.#increment_version();
			entries.clear();
			super.clear();
		}
	}

	keys() {
		return this.values();
	}

	values() {
		get(this.#version);

		var iterator = this.#entries.keys();

		return make_iterable(
			/** @type {IterableIterator<T>} */ ({
				next() {
					for (var value of iterator) {
						return { value, done: false };
					}

					return { done: true };
				}
			})
		);
	}

	entries() {
		var iterator = this.values();

		return make_iterable(
			/** @type {IterableIterator<[T, T]>} */ ({
				next() {
					for (var value of iterator) {
						return { value: [value, value], done: false };
					}

					return { done: true };
				}
			})
		);
	}

	[Symbol.iterator]() {
		return this.values();
	}

	get size() {
		return get(this.#size);
	}
}

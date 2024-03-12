import { DEV } from 'esm-env';
import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';

const read = [
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

/**
 * @template T
 */
export class ReactiveSet extends Set {
	static #inited = false;

	/** @type {Map<T, import('#client').Source<boolean>>} */
	#sources = new Map();
	#version = source(0);
	#size = source(0);

	/**
	 * @param {Iterable<T> | null | undefined} value
	 */
	constructor(value) {
		super();
		if (DEV) {
			// If the value is invalid then the native exception will fire here
			new Set(value);
		}
		if (value) {
			for (const element of value) {
				this.add(element);
			}
		}
		this.#init();
	}

	// We init as part of the first instance so that we can treeshake this class
	#init() {
		if (!ReactiveSet.#inited) {
			ReactiveSet.#inited = true;
			const proto = ReactiveSet.prototype;
			const set_proto = Set.prototype;

			for (const method of read) {
				// @ts-ignore
				proto[method] = function (...v) {
					get(this.#version);
					// @ts-ignore
					return set_proto[method].apply(this, v);
				};
			}
		}
	}

	#increment_version() {
		set(this.#version, this.#version.v + 1);
	}

	/** @param {T} value */
	has(value) {
		let possible_source = this.#sources.get(value);

		if (possible_source === undefined) {
			get(this.#version);
			return false;
		}

		return get(possible_source);
	}

	/** @param {T} value */
	add(value) {
		const sources = this.#sources;

		if (!sources.has(value)) {
			sources.set(value, source(true));
			set(this.#size, sources.size);
			this.#increment_version();
		}

		return super.add(value);
	}

	/** @param {T} value */
	delete(value) {
		const sources = this.#sources;

		let source = sources.get(value);
		if (source !== undefined) {
			sources.delete(value);
			set(this.#size, sources.size);
			set(source, false);
			this.#increment_version();
		}

		return super.delete(value);
	}

	clear() {
		const sources = this.#sources;

		if (sources.size !== 0) {
			set(this.#size, 0);
			for (const source of sources.values()) {
				set(source, false);
			}
			this.#increment_version();
		}

		sources.clear();
		super.clear();
	}

	keys() {
		return this.values();
	}

	values() {
		get(this.#version);

		const iterator = this.#sources.entries();

		return make_iterable(
			/** @type {IterableIterator<T>} */ ({
				next() {
					for (var [value, source] of iterator) {
						if (source.v) {
							return { value, done: false };
						}
					}

					return { done: true };
				}
			})
		);
	}

	entries() {
		const values = Array.from(this.values());
		let next_index = 0;

		return make_iterable(
			/** @type {any} */ ({
				next() {
					const index = next_index;
					next_index += 1;
					return index < values.length
						? { value: [values[index], values[index]], done: false }
						: { done: true };
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

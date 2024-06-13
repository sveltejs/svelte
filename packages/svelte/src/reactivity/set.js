import { DEV } from 'esm-env';
import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';
import { increment } from './utils.js';

var read_methods = ['forEach', 'isDisjointFrom', 'isSubsetOf', 'isSupersetOf'];
var set_like_methods = ['difference', 'intersection', 'symmetricDifference', 'union'];

var inited = false;

/**
 * @template T
 * @extends {Set<T>}
 */
export class ReactiveSet extends Set {
	/** @type {Map<T, import('#client').Source<boolean>>} */
	#sources = new Map();
	#version = source(0);
	#size = source(0);

	/**
	 * @param {Iterable<T> | null | undefined} [value]
	 */
	constructor(value) {
		super();

		// If the value is invalid then the native exception will fire here
		if (DEV) new Set(value);

		if (value) {
			for (var element of value) {
				super.add(element);
			}
			this.#size.v = super.size;
		}

		if (!inited) this.#init();
	}

	// We init as part of the first instance so that we can treeshake this class
	#init() {
		inited = true;

		var proto = ReactiveSet.prototype;
		var set_proto = Set.prototype;

		for (const method of read_methods) {
			// @ts-ignore
			proto[method] = function (...v) {
				get(this.#version);
				// @ts-ignore
				return set_proto[method].apply(this, v);
			};
		}

		for (const method of set_like_methods) {
			// @ts-ignore
			proto[method] = function (...v) {
				get(this.#version);
				// @ts-ignore
				var set = /** @type {Set<T>} */ (set_proto[method].apply(this, v));
				return new ReactiveSet(set);
			};
		}
	}

	/** @param {T} value */
	has(value) {
		var has = super.has(value);
		var sources = this.#sources;
		var s = sources.get(value);

		if (s === undefined) {
			if (!has) {
				// If the value doesn't exist, track the version in case it's added later
				// but don't create sources willy-nilly to track all possible values
				get(this.#version);
				return false;
			}

			s = source(true);
			sources.set(value, s);
		}

		get(s);
		return has;
	}

	/** @param {T} value */
	add(value) {
		if (!super.has(value)) {
			super.add(value);
			set(this.#size, super.size);
			increment(this.#version);
		}

		return this;
	}

	/** @param {T} value */
	delete(value) {
		var deleted = super.delete(value);
		var sources = this.#sources;
		var s = sources.get(value);

		if (s !== undefined) {
			sources.delete(value);
			set(s, false);
		}

		if (deleted) {
			set(this.#size, super.size);
			increment(this.#version);
		}

		return deleted;
	}

	clear() {
		if (super.size === 0) {
			return;
		}
		// Clear first, so we get nice console.log outputs with $inspect
		super.clear();
		var sources = this.#sources;

		for (var s of sources.values()) {
			set(s, false);
		}

		sources.clear();
		set(this.#size, 0);
		increment(this.#version);
	}

	keys() {
		return this.values();
	}

	values() {
		get(this.#version);
		return super.values();
	}

	entries() {
		get(this.#version);
		return super.entries();
	}

	[Symbol.iterator]() {
		return this.keys();
	}

	get size() {
		return get(this.#size);
	}
}

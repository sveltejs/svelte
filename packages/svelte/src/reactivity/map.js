import { DEV } from 'esm-env';
import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';
import { UNINITIALIZED } from '../constants.js';

/**
 * @template K
 * @template V
 * @extends {Map<K, V>}
 */
export class ReactiveMap extends Map {
	/** @type {Map<K, import('#client').Source<symbol>>} */
	#sources = new Map();
	#version = source(0);
	#size = source(0);

	/**
	 * @param {Iterable<readonly [K, V]> | null | undefined} [value]
	 */
	constructor(value) {
		super();

		// If the value is invalid then the native exception will fire here
		if (DEV) new Map(value);

		if (value) {
			var sources = this.#sources;

			for (var [key, v] of value) {
				sources.set(key, source(Symbol()));
				super.set(key, v);
			}

			this.#size.v = sources.size;
		}
	}

	#increment_version() {
		set(this.#version, this.#version.v + 1);
	}

	/** @param {K} key */
	has(key) {
		var sources = this.#sources;
		var s = sources.get(key);

		if (s === undefined) {
			// If we're working with a non-primitive then we can generate a signal for it
			if (typeof key !== 'object' || key === null) {
				s = source(UNINITIALIZED);
				sources.set(key, s);
			} else {
				// We should always track the version in case
				// the Set ever gets this value in the future.
				get(this.#version);
				return false;
			}
		}

		get(s);
		return super.has(key);
	}

	/**
	 * @param {(value: V, key: K, map: Map<K, V>) => void} callbackfn
	 * @param {any} [this_arg]
	 */
	forEach(callbackfn, this_arg) {
		get(this.#version);

		return super.forEach(callbackfn, this_arg);
	}

	/** @param {K} key */
	get(key) {
		var s = this.#sources.get(key);

		if (s === undefined) {
			// Re-use the has code-path to init the signal if needed and also
			// register to the version if needed.
			this.has(key);
			s = this.#sources.get(key);
			if (s === undefined) {
				return undefined;
			}
		}

		get(s);
		return super.get(key);
	}

	/**
	 * @param {K} key
	 * @param {V} value
	 * */
	set(key, value) {
		var sources = this.#sources;
		var s = sources.get(key);
		var prev_res = super.get(key);
		var res = super.set(key, value);

		if (s === undefined) {
			sources.set(key, source(Symbol()));
			set(this.#size, super.size);
			this.#increment_version();
		} else if (prev_res !== value) {
			set(s, Symbol());
		}

		return res;
	}

	/** @param {K} key */
	delete(key) {
		var sources = this.#sources;
		var s = sources.get(key);
		var res = super.delete(key);

		if (s !== undefined) {
			// Remove non-primitive keys
			if (typeof key === 'object' && key !== null) {
				sources.delete(key);
			}
			set(this.#size, super.size);
			set(s, UNINITIALIZED);
			this.#increment_version();
		}

		return res;
	}

	clear() {
		var sources = this.#sources;

		if (sources.size !== 0) {
			set(this.#size, 0);
			for (var s of sources.values()) {
				set(s, UNINITIALIZED);
			}
			this.#increment_version();
		}

		sources.clear();
		super.clear();
	}

	keys() {
		get(this.#version);
		return super.keys();
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
		return this.entries();
	}

	get size() {
		return get(this.#size);
	}
}

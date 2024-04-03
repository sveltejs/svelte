import { DEV } from 'esm-env';
import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';
import { UNINITIALIZED } from '../constants.js';
import { map } from './utils.js';

/**
 * @template K
 * @template V
 */
export class ReactiveMap extends Map {
	/** @type {Map<K, import('#client').Source<V>>} */
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
				sources.set(key, source(v));
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
		var s = this.#sources.get(key);

		if (s === undefined) {
			// We should always track the version in case
			// the Set ever gets this value in the future.
			get(this.#version);

			return false;
		}

		get(s);
		return true;
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
			// We should always track the version in case
			// the Set ever gets this value in the future.
			get(this.#version);

			return undefined;
		}

		return get(s);
	}

	/**
	 * @param {K} key
	 * @param {V} value
	 * */
	set(key, value) {
		var sources = this.#sources;
		var s = sources.get(key);

		if (s === undefined) {
			sources.set(key, source(value));
			set(this.#size, sources.size);
			this.#increment_version();
		} else {
			set(s, value);
		}

		return super.set(key, value);
	}

	/** @param {K} key */
	delete(key) {
		var sources = this.#sources;
		var s = sources.get(key);

		if (s !== undefined) {
			sources.delete(key);
			set(this.#size, sources.size);
			set(s, /** @type {V} */ (UNINITIALIZED));
			this.#increment_version();
		}

		return super.delete(key);
	}

	clear() {
		var sources = this.#sources;

		if (sources.size !== 0) {
			set(this.#size, 0);
			for (var s of sources.values()) {
				set(s, /** @type {V} */ (UNINITIALIZED));
			}
			this.#increment_version();
		}

		sources.clear();
		super.clear();
	}

	keys() {
		get(this.#version);
		return this.#sources.keys();
	}

	values() {
		get(this.#version);
		return map(this.#sources.values(), get);
	}

	entries() {
		get(this.#version);
		return map(
			this.#sources.entries(),
			([key, source]) => /** @type {[K, V]} */ ([key, get(source)])
		);
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	get size() {
		return get(this.#size);
	}
}

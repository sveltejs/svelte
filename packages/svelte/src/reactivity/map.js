import { DEV } from 'esm-env';
import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';
import { increment } from './utils.js';

/**
 * @template K
 * @template V
 * @extends {Map<K, V>}
 */
export class ReactiveMap extends Map {
	/** @type {Map<K, import('#client').Source<number>>} */
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
			for (var [key, v] of value) {
				super.set(key, v);
			}
			this.#size.v = super.size;
		}
	}

	/** @param {K} key */
	has(key) {
		var sources = this.#sources;
		var s = sources.get(key);

		if (s === undefined) {
			var ret = super.get(key);
			if (ret !== undefined) {
				s = source(0);
				sources.set(key, s);
			} else {
				// We should always track the version in case
				// the Set ever gets this value in the future.
				get(this.#version);
				return false;
			}
		}

		get(s);
		return true;
	}

	/**
	 * @param {(value: V, key: K, map: Map<K, V>) => void} callbackfn
	 * @param {any} [this_arg]
	 */
	forEach(callbackfn, this_arg) {
		this.#read_all();
		super.forEach(callbackfn, this_arg);
	}

	/** @param {K} key */
	get(key) {
		var sources = this.#sources;
		var s = sources.get(key);

		if (s === undefined) {
			var ret = super.get(key);
			if (ret !== undefined) {
				s = source(0);
				sources.set(key, s);
			} else {
				// We should always track the version in case
				// the Set ever gets this value in the future.
				get(this.#version);
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
			sources.set(key, source(0));
			set(this.#size, super.size);
			increment(this.#version);
		} else if (prev_res !== value) {
			increment(s);
		}

		return res;
	}

	/** @param {K} key */
	delete(key) {
		var sources = this.#sources;
		var s = sources.get(key);
		var res = super.delete(key);

		if (s !== undefined) {
			sources.delete(key);
			set(this.#size, super.size);
			set(s, -1);
			increment(this.#version);
		}

		return res;
	}

	clear() {
		if (super.size === 0) {
			return;
		}
		// Clear first, so we get nice console.log outputs with $inspect
		super.clear();
		var sources = this.#sources;
		set(this.#size, 0);
		for (var s of sources.values()) {
			set(s, -1);
		}
		increment(this.#version);
		sources.clear();
	}

	#read_all() {
		get(this.#version);

		var sources = this.#sources;
		if (this.#size.v !== sources.size) {
			for (var key of super.keys()) {
				if (!sources.has(key)) {
					sources.set(key, source(0));
				}
			}
		}

		for (var [, s] of this.#sources) {
			get(s);
		}
	}

	keys() {
		get(this.#version);
		return super.keys();
	}

	values() {
		this.#read_all();
		return super.values();
	}

	entries() {
		this.#read_all();
		return super.entries();
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	get size() {
		get(this.#size);
		return super.size;
	}
}

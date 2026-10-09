/** @import { WarpKey } from '#shared' */
import { async_mode_flag } from '../flags/index.js';
import * as e from './errors.js';
import { get_or_insert, get_or_insert_computed } from '../shared/utils.js';

/**
 * A `Map` whose contents are sent from the server to the client. Values added to it
 * during server rendering (or inside `withWarp`) are serialized into the rendered
 * HTML, so that the same `Warp` can read them on the client during hydration.
 *
 * Values can be anything [`devalue`](https://github.com/sveltejs/devalue) can serialize,
 * including promises.
 *
 * @template {WarpKey} K
 * @template V
 * @implements {Map<K, V>}
 */
export class Warp {
	/** @type {string} */
	#id;

	/**
	 * @param {string} id A unique identifier for this `Warp`, which must match on the server and the client.
	 * Libraries should prefix it with their package name to avoid collisions.
	 */
	constructor(id) {
		this.#id = id;
	}

	/** @returns {Map<K, V>} */
	#values() {
		if (!async_mode_flag) {
			e.experimental_async_required('Warp');
		}

		const store = ((window.__svelte ??= {}).w ??= new Map());
		let values = store.get(this.#id);

		if (values === undefined) {
			values = new Map();
			store.set(this.#id, values);
		}

		return /** @type {Map<K, V>} */ (values);
	}

	/**
	 * @param {K} key
	 * @returns {V | undefined}
	 */
	get(key) {
		return this.#values().get(key);
	}

	/**
	 * @param {K} key
	 * @returns {boolean}
	 */
	has(key) {
		return this.#values().has(key);
	}

	/**
	 * @param {K} key
	 * @param {V} value
	 * @returns {this}
	 */
	set(key, value) {
		this.#values().set(key, value);
		return this;
	}

	/**
	 * Returns the value for `key` if it exists, otherwise adds `value` and returns it.
	 * @param {K} key
	 * @param {V} value
	 * @returns {V}
	 */
	getOrInsert(key, value) {
		return get_or_insert(this.#values(), key, value);
	}

	/**
	 * Returns the value for `key` if it exists, otherwise calls `callback` and adds the result.
	 * @param {K} key
	 * @param {(key: K) => V} callback
	 * @returns {V}
	 */
	getOrInsertComputed(key, callback) {
		return get_or_insert_computed(this.#values(), key, callback);
	}

	/**
	 * @param {K} key
	 * @returns {boolean}
	 */
	delete(key) {
		return this.#values().delete(key);
	}

	clear() {
		this.#values().clear();
	}

	/**
	 * @param {(value: V, key: K, map: Map<K, V>) => void} callback
	 * @param {any} [this_arg]
	 */
	forEach(callback, this_arg) {
		this.#values().forEach(callback, this_arg);
	}

	entries() {
		return this.#values().entries();
	}

	keys() {
		return this.#values().keys();
	}

	values() {
		return this.#values().values();
	}

	get size() {
		return this.#values().size;
	}

	[Symbol.iterator]() {
		return this.#values()[Symbol.iterator]();
	}

	get [Symbol.toStringTag]() {
		return 'Warp';
	}
}

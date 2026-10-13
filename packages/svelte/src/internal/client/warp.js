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
	 * While values are still streaming in from the server, records that `key` was changed,
	 * so that a value for it that arrives later doesn't overwrite the change
	 * @param {K} key
	 */
	#touch(key) {
		if (!is_streaming()) return;

		const touched = get_touched();
		let keys = touched.get(this.#id);

		if (keys === true) return;

		if (keys === undefined) {
			keys = new Set();
			touched.set(this.#id, keys);
		}

		keys.add(key);
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
		this.#touch(key);
		return this;
	}

	/**
	 * Returns the value for `key` if it exists, otherwise adds `value` and returns it.
	 * @param {K} key
	 * @param {V} value
	 * @returns {V}
	 */
	getOrInsert(key, value) {
		const values = this.#values();
		if (!values.has(key)) this.#touch(key);
		return get_or_insert(values, key, value);
	}

	/**
	 * Returns the value for `key` if it exists, otherwise calls `callback` and adds the result.
	 * @param {K} key
	 * @param {(key: K) => V} callback
	 * @returns {V}
	 */
	getOrInsertComputed(key, callback) {
		return get_or_insert_computed(this.#values(), key, (key) => {
			const value = callback(key);
			this.#touch(key);
			return value;
		});
	}

	/**
	 * @param {K} key
	 * @returns {boolean}
	 */
	delete(key) {
		// even if the key doesn't exist yet, a value for it may still arrive from the server
		this.#touch(key);
		return this.#values().delete(key);
	}

	clear() {
		this.#values().clear();

		if (is_streaming()) {
			// values that arrive later are discarded too
			get_touched().set(this.#id, true);
		}
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

/**
 * Whether values are still streaming in from the server. Streaming can only happen while the document is
 * still loading, so if the connection drops before the stream finishes, this still becomes `false` eventually
 */
function is_streaming() {
	return (window.__svelte?.s ?? 0) > 0 && document.readyState === 'loading';
}

/** The keys that were changed in each `Warp` while values were streaming in */
function get_touched() {
	return ((window.__svelte ??= {}).t ??= new Map());
}

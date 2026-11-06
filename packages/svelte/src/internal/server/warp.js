/** @import { WarpKey } from '#shared' */
/** @import { All } from './warp-store.js' */
import { DEV } from 'esm-env';
import { async_mode_flag } from '../flags/index.js';
import { get_render_context } from './render-context.js';
import * as e from './errors.js';
import { ALL } from './warp-store.js';

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

	/**
	 * @param {K | All} key The key that's being read, or `ALL` if every key is
	 * @returns {Map<K, V> | undefined}
	 */
	#values(key) {
		const context = get_context();
		return /** @type {Map<K, V> | undefined} */ (
			context.warp.read(this.#id, key, context.in_boundary)
		);
	}

	/**
	 * @param {K} key
	 * @returns {V | undefined}
	 */
	get(key) {
		return this.#values(key)?.get(key);
	}

	/**
	 * @param {K} key
	 * @returns {boolean}
	 */
	has(key) {
		return this.#values(key)?.has(key) ?? false;
	}

	/**
	 * @param {K} key
	 * @param {V} value
	 * @returns {this}
	 */
	set(key, value) {
		const context = get_context();

		if (context.warp.values(this.#id)?.has(key)) {
			e.warp_key_exists(
				String(key),
				this.#id,
				DEV ? `. It was first set in:\n${context.warp.stack(this.#id, key)}` : ''
			);
		}

		context.warp.add(this.#id, key, value, context.in_boundary);
		return this;
	}

	/**
	 * Returns the value for `key` if it exists, otherwise adds `value` and returns it.
	 * @param {K} key
	 * @param {V} value
	 * @returns {V}
	 */
	getOrInsert(key, value) {
		const context = get_context();

		if (context.warp.values(this.#id)?.has(key)) {
			return /** @type {V} */ (context.warp.read(this.#id, key, context.in_boundary)?.get(key));
		}

		context.warp.add(this.#id, key, value, context.in_boundary);
		return value;
	}

	/**
	 * Returns the value for `key` if it exists, otherwise calls `callback` and adds the result.
	 * @param {K} key
	 * @param {(key: K) => V} callback
	 * @returns {V}
	 */
	getOrInsertComputed(key, callback) {
		const context = get_context();

		if (context.warp.values(this.#id)?.has(key)) {
			return /** @type {V} */ (context.warp.read(this.#id, key, context.in_boundary)?.get(key));
		}

		const value = callback(key);
		context.warp.add(this.#id, key, value, context.in_boundary);
		return value;
	}

	/**
	 * Not supported on the server, since the value may already be in use.
	 * @param {K} key
	 * @returns {boolean}
	 */
	delete(key) {
		e.warp_method_unsupported('delete');
	}

	/**
	 * Not supported on the server, since the values may already be in use.
	 * @returns {void}
	 */
	clear() {
		e.warp_method_unsupported('clear');
	}

	/**
	 * @param {(value: V, key: K, map: Map<K, V>) => void} callback
	 * @param {any} [this_arg]
	 */
	forEach(callback, this_arg) {
		// pass the `Warp` rather than the underlying map, so that `callback` can't modify it directly
		this.#values(ALL)?.forEach((value, key) => callback.call(this_arg, value, key, this));
	}

	entries() {
		return (this.#values(ALL) ?? new Map()).entries();
	}

	keys() {
		return (this.#values(ALL) ?? new Map()).keys();
	}

	values() {
		return (this.#values(ALL) ?? new Map()).values();
	}

	get size() {
		return this.#values(ALL)?.size ?? 0;
	}

	[Symbol.iterator]() {
		return (this.#values(ALL) ?? new Map())[Symbol.iterator]();
	}

	get [Symbol.toStringTag]() {
		return 'Warp';
	}
}

function get_context() {
	if (!async_mode_flag) {
		e.experimental_async_required('Warp');
	}

	return get_render_context();
}

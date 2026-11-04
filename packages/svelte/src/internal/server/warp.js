/** @import { WarpStore } from '#server' */
/** @import { WarpKey } from '#shared' */
import { DEV } from 'esm-env';
import { async_mode_flag } from '../flags/index.js';
import { get_render_context } from './render-context.js';
import { get_user_code_location } from './dev.js';
import * as e from './errors.js';

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

	/** @returns {Map<K, V> | undefined} */
	#values() {
		return /** @type {Map<K, V> | undefined} */ (get_store().values.get(this.#id));
	}

	/**
	 * @param {K} key
	 * @returns {V | undefined}
	 */
	get(key) {
		return this.#values()?.get(key);
	}

	/**
	 * @param {K} key
	 * @returns {boolean}
	 */
	has(key) {
		return this.#values()?.has(key) ?? false;
	}

	/**
	 * @param {K} key
	 * @param {V} value
	 * @returns {this}
	 */
	set(key, value) {
		const store = get_store();

		if (store.values.get(this.#id)?.has(key)) {
			e.warp_key_exists(
				String(key),
				this.#id,
				DEV ? `. It was first set in:\n${get_stack(store, this.#id, key)}` : ''
			);
		}

		set(store, this.#id, key, value);
		return this;
	}

	/**
	 * Returns the value for `key` if it exists, otherwise adds `value` and returns it.
	 * @param {K} key
	 * @param {V} value
	 * @returns {V}
	 */
	getOrInsert(key, value) {
		const store = get_store();
		const values = store.values.get(this.#id);

		if (values?.has(key)) return /** @type {V} */ (values.get(key));

		set(store, this.#id, key, value);
		return value;
	}

	/**
	 * Returns the value for `key` if it exists, otherwise calls `callback` and adds the result.
	 * @param {K} key
	 * @param {(key: K) => V} callback
	 * @returns {V}
	 */
	getOrInsertComputed(key, callback) {
		const store = get_store();
		const values = store.values.get(this.#id);

		if (values?.has(key)) return /** @type {V} */ (values.get(key));

		const value = callback(key);
		set(store, this.#id, key, value);
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
		this.#values()?.forEach((value, key) => callback.call(this_arg, value, key, this));
	}

	entries() {
		return (this.#values() ?? new Map()).entries();
	}

	keys() {
		return (this.#values() ?? new Map()).keys();
	}

	values() {
		return (this.#values() ?? new Map()).values();
	}

	get size() {
		return this.#values()?.size ?? 0;
	}

	[Symbol.iterator]() {
		return (this.#values() ?? new Map())[Symbol.iterator]();
	}

	get [Symbol.toStringTag]() {
		return 'Warp';
	}
}

function get_store() {
	if (!async_mode_flag) {
		e.experimental_async_required('Warp');
	}

	return get_render_context().warp;
}

/**
 * @param {WarpStore} store
 * @param {string} id
 * @param {WarpKey} key
 * @param {unknown} value
 */
function set(store, id, key, value) {
	record(store, id, key);

	let values = store.values.get(id);
	if (values === undefined) store.values.set(id, (values = new Map()));
	values.set(key, value);
}

/**
 * Does everything that needs to happen when a value is added, other than actually adding it.
 * Throws if it can't be added, so that `getOrInsertComputed` doesn't add it either
 * @param {WarpStore} store
 * @param {string} id
 * @param {WarpKey} key
 */
function record(store, id, key) {
	if (store.emitted) {
		e.warp_set_after_render(String(key), id);
	}

	if (DEV) {
		let stacks = store.stacks.get(id);

		if (stacks === undefined) {
			stacks = new Map();
			store.stacks.set(id, stacks);
		}

		stacks.set(key, get_user_code_location());
	}
}

/**
 * dev-only: the location at which a value was set
 * @param {WarpStore} store
 * @param {string} id
 * @param {WarpKey} key
 */
function get_stack(store, id, key) {
	return store.stacks.get(id)?.get(key) ?? '<missing stack trace>';
}

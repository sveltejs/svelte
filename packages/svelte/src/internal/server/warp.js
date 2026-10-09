/** @import { WarpStore } from '#server' */
/** @import { WarpKey } from '#shared' */
import { DEV } from 'esm-env';
import { async_mode_flag } from '../flags/index.js';
import { get_render_context } from './render-context.js';
import { get_user_code_location } from './dev.js';
import * as e from './errors.js';
import { get_or_insert_computed } from '../shared/utils.js';

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
		return /** @type {Map<K, V>} */ (get_values(get_store(), this.#id));
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
		const store = get_store();

		if (get_values(store, this.#id).has(key)) {
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
		const values = /** @type {Map<K, V>} */ (get_values(store, this.#id));

		return get_or_insert_computed(values, key, () => {
			record(store, this.#id, key, value);
			return value;
		});
	}

	/**
	 * Returns the value for `key` if it exists, otherwise calls `callback` and adds the result.
	 * @param {K} key
	 * @param {(key: K) => V} callback
	 * @returns {V}
	 */
	getOrInsertComputed(key, callback) {
		const store = get_store();
		const values = /** @type {Map<K, V>} */ (get_values(store, this.#id));

		return get_or_insert_computed(values, key, (key) => {
			const value = callback(key);
			record(store, this.#id, key, value);
			return value;
		});
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

function get_store() {
	if (!async_mode_flag) {
		e.experimental_async_required('Warp');
	}

	return get_render_context().warp;
}

/**
 * @param {WarpStore} store
 * @param {string} id
 */
function get_values(store, id) {
	let values = store.values.get(id);

	if (values === undefined) {
		values = new Map();
		store.values.set(id, values);
	}

	return values;
}

/**
 * @param {WarpStore} store
 * @param {string} id
 * @param {WarpKey} key
 * @param {unknown} value
 */
function set(store, id, key, value) {
	record(store, id, key, value);
	get_values(store, id).set(key, value);
}

/**
 * Does everything that needs to happen when a value is added, other than actually adding it.
 * Throws if it can't be added, so that `getOrInsertComputed` doesn't add it either
 * @param {WarpStore} store
 * @param {string} id
 * @param {WarpKey} key
 * @param {unknown} value
 */
function record(store, id, key, value) {
	if (store.emitted) {
		e.warp_set_after_render(id, String(key));
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
export function get_stack(store, id, key) {
	return store.stacks.get(id)?.get(key) ?? '<missing stack trace>';
}

/**
 * @param {unknown} value
 * @returns {value is Promise<unknown>}
 */
export function is_promise(value) {
	// we use this check rather than `instanceof Promise` because it works cross-realm
	return Object.prototype.toString.call(value) === '[object Promise]';
}

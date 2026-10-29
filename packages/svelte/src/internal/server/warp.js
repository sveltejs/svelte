/** @import { RenderContext, WarpStore } from '#server' */
/** @import { WarpKey } from '#shared' */
import { DEV } from 'esm-env';
import { async_mode_flag } from '../flags/index.js';
import { get_render_context } from './render-context.js';
import { get_user_code_location } from './dev.js';
import * as e from './errors.js';
import { get_or_insert_computed, is_native_promise, noop } from '../shared/utils.js';

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
		return /** @type {Map<K, V>} */ (get_values(get_context().warp, this.#id));
	}

	/**
	 * Reads all of the values, which means they're needed by the render
	 * @returns {Map<K, V>}
	 */
	#read_all() {
		const context = get_context();
		read(context, this.#id);
		return /** @type {Map<K, V>} */ (get_values(context.warp, this.#id));
	}

	/**
	 * @param {K} key
	 * @returns {V | undefined}
	 */
	get(key) {
		const context = get_context();
		read(context, this.#id, key);
		return /** @type {V | undefined} */ (get_values(context.warp, this.#id).get(key));
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
		const context = get_context();
		const values = get_values(context.warp, this.#id);

		if (values.has(key)) {
			e.warp_key_exists(
				String(key),
				this.#id,
				DEV ? `. It was first set in:\n${get_stack(context.warp, this.#id, key)}` : ''
			);
		}

		record(context, this.#id, key, value);
		values.set(key, value);
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
		const values = /** @type {Map<K, V>} */ (get_values(context.warp, this.#id));

		if (values.has(key)) {
			read(context, this.#id, key);
		}

		return get_or_insert_computed(values, key, () => {
			record(context, this.#id, key, value);
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
		const context = get_context();
		const values = /** @type {Map<K, V>} */ (get_values(context.warp, this.#id));

		if (values.has(key)) {
			read(context, this.#id, key);
		}

		return get_or_insert_computed(values, key, (key) => {
			const value = callback(key);
			record(context, this.#id, key, value);
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
		this.#read_all().forEach(callback, this_arg);
	}

	entries() {
		return this.#read_all().entries();
	}

	keys() {
		return this.#values().keys();
	}

	values() {
		return this.#read_all().values();
	}

	get size() {
		return this.#values().size;
	}

	[Symbol.iterator]() {
		return this.#read_all()[Symbol.iterator]();
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
 * Called when a value is read. If it was added by background work, but is read by the rest of the
 * render before the values have been serialized, it's needed to hydrate, so it goes in the `head`
 * @param {RenderContext} context
 * @param {string} id
 * @param {WarpKey} [key] If omitted, all of the values were read
 */
function read(context, id, key) {
	if (context.background || context.warp.emitted) return;

	const keys = context.warp.background.get(id);
	if (keys === undefined) return;

	if (key === undefined) {
		context.warp.background.delete(id);
	} else {
		keys.delete(key);
	}
}

/**
 * Does everything that needs to happen when a value is added, other than actually adding it.
 * Throws if it can't be added, so that `getOrInsertComputed` doesn't add it either
 * @param {RenderContext} context
 * @param {string} id
 * @param {WarpKey} key
 * @param {unknown} value
 */
function record(context, id, key, value) {
	const store = context.warp;

	if ((store.emitted || context.background) && is_native_promise(value)) {
		// devalue only subscribes to streamed promises once it reaches them, which can be after they reject
		Promise.prototype.then.call(value, undefined, noop);
	}

	if (store.emitted) {
		if (store.late === null) {
			e.warp_set_after_render(String(key), id);
		}

		store.late(id, key, value);
	} else if (context.background) {
		let keys = store.background.get(id);

		if (keys === undefined) {
			keys = new Set();
			store.background.set(id, keys);
		}

		keys.add(key);
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

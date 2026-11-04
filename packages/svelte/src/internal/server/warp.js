/** @import { RenderContext, WarpStore } from '#server' */
/** @import { WarpKey } from '#shared' */
import { DEV } from 'esm-env';
import { async_mode_flag } from '../flags/index.js';
import { get_render_context } from './render-context.js';
import { get_user_code_location } from './dev.js';
import * as e from './errors.js';
import { is_native_promise, noop } from '../shared/utils.js';

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
		use(context, this.#id, key);
		return /** @type {Map<K, V> | undefined} */ (context.warp.values.get(this.#id));
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

		if (context.warp.values.get(this.#id)?.has(key)) {
			e.warp_key_exists(
				String(key),
				this.#id,
				DEV ? `. It was first set in:\n${get_stack(context.warp, this.#id, key)}` : ''
			);
		}

		set(context, this.#id, key, value);
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
		const values = context.warp.values.get(this.#id);

		if (values?.has(key)) {
			use(context, this.#id, key);
			return /** @type {V} */ (values.get(key));
		}

		set(context, this.#id, key, value);
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
		const values = context.warp.values.get(this.#id);

		if (values?.has(key)) {
			use(context, this.#id, key);
			return /** @type {V} */ (values.get(key));
		}

		const value = callback(key);
		set(context, this.#id, key, value);
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

/** Passed to `use` when every key is being read */
const ALL = Symbol();

// (a `typedef`, since TypeScript considers `typeof ALL` circular in `#values`'s parameter)
/** @typedef {typeof ALL} All */

function get_context() {
	if (!async_mode_flag) {
		e.experimental_async_required('Warp');
	}

	return get_render_context();
}

/**
 * @param {RenderContext} context
 * @param {string} id
 * @param {WarpKey} key
 * @param {unknown} value
 */
function set(context, id, key, value) {
	record(context, id, key, value);

	let values = context.warp.values.get(id);
	if (values === undefined) context.warp.values.set(id, (values = new Map()));
	values.set(key, value);
}

/**
 * Does everything that needs to happen when a value is added, other than actually adding it.
 * Throws if it can't be added, so that it isn't added
 * @param {RenderContext} context
 * @param {string} id
 * @param {WarpKey} key
 * @param {unknown} value
 */
function record(context, id, key, value) {
	const store = context.warp;

	if (is_native_promise(value)) {
		// the rejection is sent to the client, but devalue only subscribes once it reaches the
		// promise, which can be after it rejects (e.g. if it was added by work in a pending boundary)
		Promise.prototype.then.call(value, undefined, noop);
	}

	if (store.emitted && store.late === null) {
		e.warp_set_after_render(String(key), id);
	}

	// values added inside pending boundaries go in the `tail`, so that the `head` only contains what
	// the rest of the render added (and used). so do values added after the `head` was serialized
	if (context.boundary !== null || store.emitted) {
		if (context.boundary !== null && !store.emitted) {
			let keys = store.owned.get(id);
			if (keys === undefined) store.owned.set(id, (keys = new Set()));
			keys.add(key);
		}

		store.queue.push([id, key, value]);
		store.late?.();
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
 * Called when a key is read. If the work inside a pending boundary added it, but it's read outside
 * one before the `head` is serialized, it moves to the `head`, since the rest of the render depends on it
 * @param {RenderContext} context
 * @param {string} id
 * @param {WarpKey | All} key
 */
function use(context, id, key) {
	const store = context.warp;
	if (context.boundary !== null || store.emitted) return;

	if (key === ALL) {
		store.owned.delete(id);
	} else {
		store.owned.get(id)?.delete(key);
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

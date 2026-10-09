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

	/**
	 * The values for this `Warp`. If changes were made to them while values were still streaming
	 * in from the server, and the stream has since finished, they're applied first
	 * @returns {Map<K, V>}
	 */
	#values() {
		if (!async_mode_flag) {
			e.experimental_async_required('Warp');
		}

		const svelte = (window.__svelte ??= {});
		const store = (svelte.w ??= new Map());
		let values = store.get(this.#id);

		if (values === undefined) {
			values = new Map();
			store.set(this.#id, values);
		}

		const overlay = svelte.m?.get(this.#id);

		if (overlay !== undefined && !is_streaming()) {
			overlay.apply(values);
			svelte.m?.delete(this.#id);
		}

		return /** @type {Map<K, V>} */ (values);
	}

	/**
	 * While values are still streaming in from the server, changes are made to an overlay rather
	 * than the values themselves, so that they can't interfere with the stream (or vice versa)
	 * @param {boolean} create
	 * @returns {Overlay | null}
	 */
	#overlay(create) {
		if (!is_streaming()) return null;

		const svelte = /** @type {NonNullable<Window['__svelte']>} */ (window.__svelte);
		let overlay = svelte.m?.get(this.#id) ?? null;

		if (overlay === null && create) {
			overlay = new Overlay();
			(svelte.m ??= new Map()).set(this.#id, overlay);
		}

		return overlay;
	}

	/**
	 * @param {K} key
	 * @returns {V | undefined}
	 */
	get(key) {
		const values = this.#values();
		const overlay = this.#overlay(false);

		return /** @type {V | undefined} */ (
			overlay === null ? values.get(key) : overlay.get(values, key)
		);
	}

	/**
	 * @param {K} key
	 * @returns {boolean}
	 */
	has(key) {
		const values = this.#values();
		const overlay = this.#overlay(false);

		return overlay === null ? values.has(key) : overlay.has(values, key);
	}

	/**
	 * @param {K} key
	 * @param {V} value
	 * @returns {this}
	 */
	set(key, value) {
		const values = this.#values();
		const overlay = this.#overlay(true);

		if (overlay === null) {
			values.set(key, value);
		} else {
			overlay.set(key, value);
		}

		return this;
	}

	/**
	 * Returns the value for `key` if it exists, otherwise adds `value` and returns it.
	 * @param {K} key
	 * @param {V} value
	 * @returns {V}
	 */
	getOrInsert(key, value) {
		if (!is_streaming()) {
			return get_or_insert(this.#values(), key, value);
		}

		if (this.has(key)) return /** @type {V} */ (this.get(key));
		this.set(key, value);
		return value;
	}

	/**
	 * Returns the value for `key` if it exists, otherwise calls `callback` and adds the result.
	 * @param {K} key
	 * @param {(key: K) => V} callback
	 * @returns {V}
	 */
	getOrInsertComputed(key, callback) {
		if (!is_streaming()) {
			return get_or_insert_computed(this.#values(), key, callback);
		}

		if (this.has(key)) return /** @type {V} */ (this.get(key));
		const value = callback(key);
		this.set(key, value);
		return value;
	}

	/**
	 * @param {K} key
	 * @returns {boolean}
	 */
	delete(key) {
		const values = this.#values();
		const overlay = this.#overlay(true);

		return overlay === null ? values.delete(key) : overlay.delete(values, key);
	}

	clear() {
		const values = this.#values();
		const overlay = this.#overlay(true);

		if (overlay === null) {
			values.clear();
		} else {
			overlay.clear();
		}
	}

	/**
	 * @param {(value: V, key: K, map: Map<K, V>) => void} callback
	 * @param {any} [this_arg]
	 */
	forEach(callback, this_arg) {
		for (const [key, value] of this.entries()) {
			callback.call(this_arg, value, key, this);
		}
	}

	/** @returns {IterableIterator<[K, V]>} */
	entries() {
		const values = this.#values();
		const overlay = this.#overlay(false);

		return overlay === null
			? values.entries()
			: /** @type {IterableIterator<[K, V]>} */ (overlay.entries(values));
	}

	/** @returns {IterableIterator<K>} */
	*keys() {
		for (const [key] of this.entries()) yield key;
	}

	/** @returns {IterableIterator<V>} */
	*values() {
		for (const [, value] of this.entries()) yield value;
	}

	get size() {
		const values = this.#values();
		const overlay = this.#overlay(false);

		if (overlay === null) return values.size;

		let size = 0;
		for (const _ of overlay.entries(values)) size += 1;
		return size;
	}

	[Symbol.iterator]() {
		return this.entries();
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

const TOMBSTONE = Symbol('deleted');

/**
 * Changes made to a `Warp` while values are still streaming in from the server. They take precedence
 * over the values from the server (including ones that arrive later), and are applied once the stream
 * has finished.
 */
export class Overlay {
	/** Whether the `Warp` was cleared, which hides all the values from the server */
	cleared = false;

	/**
	 * Values that were set (or deleted, as `TOMBSTONE`) since the `Warp` was last cleared
	 * @type {Map<WarpKey, unknown>}
	 */
	changes = new Map();

	/**
	 * Keys from the server that were deleted and then set again, which moves them to the end
	 * @type {Set<WarpKey>}
	 */
	moved = new Set();

	/**
	 * @param {Map<WarpKey, unknown>} values
	 * @param {WarpKey} key
	 */
	get(values, key) {
		if (this.changes.has(key)) {
			const value = this.changes.get(key);
			return value === TOMBSTONE ? undefined : value;
		}

		return this.cleared ? undefined : values.get(key);
	}

	/**
	 * @param {Map<WarpKey, unknown>} values
	 * @param {WarpKey} key
	 */
	has(values, key) {
		if (this.changes.has(key)) return this.changes.get(key) !== TOMBSTONE;
		return !this.cleared && values.has(key);
	}

	/**
	 * @param {WarpKey} key
	 * @param {unknown} value
	 */
	set(key, value) {
		if (this.changes.get(key) === TOMBSTONE) {
			// like in a `Map`, a key that was deleted and then set again goes to the end
			this.changes.delete(key);
			this.moved.add(key);
		}

		this.changes.set(key, value);
	}

	/**
	 * @param {Map<WarpKey, unknown>} values
	 * @param {WarpKey} key
	 */
	delete(values, key) {
		const existed = this.has(values, key);

		// even if it doesn't exist yet, it may still arrive from the server, and must stay deleted
		this.changes.set(key, TOMBSTONE);
		this.moved.delete(key);

		return existed;
	}

	clear() {
		this.cleared = true;
		this.changes.clear();
		this.moved.clear();
	}

	/**
	 * @param {Map<WarpKey, unknown>} values
	 * @returns {Generator<[WarpKey, unknown]>}
	 */
	*entries(values) {
		if (!this.cleared) {
			for (const [key, value] of values) {
				if (this.moved.has(key)) continue;

				if (this.changes.has(key)) {
					const change = this.changes.get(key);
					if (change !== TOMBSTONE) yield [key, change];
				} else {
					yield [key, value];
				}
			}
		}

		for (const [key, value] of this.changes) {
			if (value === TOMBSTONE) continue;
			if (!this.cleared && !this.moved.has(key) && values.has(key)) continue;
			yield [key, value];
		}
	}

	/** @param {Map<WarpKey, unknown>} values */
	apply(values) {
		if (this.cleared) values.clear();

		for (const [key, value] of this.changes) {
			if (value === TOMBSTONE || this.moved.has(key)) values.delete(key);
			if (value !== TOMBSTONE) values.set(key, value);
		}
	}
}

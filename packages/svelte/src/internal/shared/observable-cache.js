/** @import { CacheEntry } from '#shared' */

/**
 * @extends {Map<string, CacheEntry>}
 */
export class ObservableCache extends Map {
	/** @type {Set<(key: string, value: CacheEntry) => void>} */
	#insert_callbacks = new Set();

	/** @type {Set<(key: string, value: CacheEntry, old_value: CacheEntry) => void>} */
	#update_callbacks = new Set();

	/** @type {Set<(key: string, old_value: CacheEntry) => void>} */
	#delete_callbacks = new Set();

	/**
	 * @param {(key: string, value: CacheEntry) => void} callback
	 * @returns {() => void} Function to unregister the callback
	 */
	on_insert(callback) {
		this.#insert_callbacks.add(callback);
		return () => this.#insert_callbacks.delete(callback);
	}

	/**
	 * @param {(key: string, value: CacheEntry, old_value: CacheEntry) => void} callback
	 * @returns {() => void} Function to unregister the callback
	 */
	on_update(callback) {
		this.#update_callbacks.add(callback);
		return () => this.#update_callbacks.delete(callback);
	}

	/**
	 * @param {(key: string, old_value: CacheEntry) => void} callback
	 * @returns {() => void} Function to unregister the callback
	 */
	on_delete(callback) {
		this.#delete_callbacks.add(callback);
		return () => this.#delete_callbacks.delete(callback);
	}

	/**
	 * @param {string} key
	 * @param {CacheEntry} value
	 * @returns {this}
	 */
	set(key, value) {
		const had = this.has(key);
		if (had) {
			const old_value = /** @type {CacheEntry} */ (super.get(key));
			super.set(key, value);
			for (const callback of this.#update_callbacks) {
				callback(key, value, old_value);
			}
		} else {
			super.set(key, value);
			for (const callback of this.#insert_callbacks) {
				callback(key, value);
			}
		}
		return this;
	}

	/**
	 * @param {string} key
	 * @returns {boolean}
	 */
	delete(key) {
		const old_value = super.get(key);
		const deleted = super.delete(key);
		if (deleted) {
			for (const callback of this.#delete_callbacks) {
				callback(key, /** @type {CacheEntry} */ (old_value));
			}
		}
		return deleted;
	}

	clear() {
		for (const [key, value] of this) {
			for (const callback of this.#delete_callbacks) {
				callback(key, value);
			}
		}
		super.clear();
	}
}

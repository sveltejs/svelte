/** @import { ObservableCache } from './observable-cache.js' */

/**
 * @template T
 * @implements {ReadonlyMap<string, T>} */
export class BaseCacheObserver {
	/**
	 * This is a function so that you can create an ObservableCache instance globally and as long as you don't actually
	 * use it until you're inside the server render lifecycle you'll be okay
	 * @type {() => ObservableCache}
	 */
	#get_cache;

	/** @type {string} */
	#prefix;

	/**
	 * @param {() => ObservableCache} get_cache
	 * @param {string} [prefix]
	 */
	constructor(get_cache, prefix = '') {
		this.#get_cache = get_cache;
		this.#prefix = prefix;
	}

	/**
	 * Register a callback to be called when a new key is inserted
	 * @param {(key: string, value: T) => void} callback
	 * @returns {() => void} Function to unregister the callback
	 */
	onInsert(callback) {
		return this.#get_cache().on_insert((key, value) => {
			if (!key.startsWith(this.#prefix)) return;
			callback(key, value.item);
		});
	}

	/**
	 * Register a callback to be called when an existing key is updated
	 * @param {(key: string, value: T, old_value: T) => void} callback
	 * @returns {() => void} Function to unregister the callback
	 */
	onUpdate(callback) {
		return this.#get_cache().on_update((key, value, old_value) => {
			if (!key.startsWith(this.#prefix)) return;
			callback(key, value.item, old_value.item);
		});
	}

	/**
	 * Register a callback to be called when a key is deleted
	 * @param {(key: string, old_value: T) => void} callback
	 * @returns {() => void} Function to unregister the callback
	 */
	onDelete(callback) {
		return this.#get_cache().on_delete((key, old_value) => {
			if (!key.startsWith(this.#prefix)) return;
			callback(key, old_value.item);
		});
	}

	/** @param {string} key */
	get(key) {
		const entry = this.#get_cache().get(this.#key(key));
		return entry?.item;
	}

	/** @param {string} key */
	has(key) {
		return this.#get_cache().has(this.#key(key));
	}

	get size() {
		return [...this.keys()].length;
	}

	/** @param {(item: T, key: string, map: ReadonlyMap<string, T>) => void} cb */
	forEach(cb) {
		this.entries().forEach(([key, entry]) => cb(entry, key, this));
	}

	*entries() {
		for (const [key, entry] of this.#get_cache().entries()) {
			if (!key.startsWith(this.#prefix)) continue;
			yield /** @type {[string, T]} */ ([key, entry.item]);
		}
		return undefined;
	}

	*keys() {
		for (const [key] of this.entries()) {
			yield key;
		}
		return undefined;
	}

	*values() {
		for (const [, entry] of this.entries()) {
			yield entry;
		}
		return undefined;
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	/** @param {string} key */
	#key(key) {
		return this.#prefix + key;
	}
}

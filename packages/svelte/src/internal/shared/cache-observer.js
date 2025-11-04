/** @import { CacheEntry } from '#shared' */

/**
 * @template T
 * @implements {ReadonlyMap<string, T>} */
export class BaseCacheObserver {
	/**
	 * This is a function so that you can create an ObservableCache instance globally and as long as you don't actually
	 * use it until you're inside the server render lifecycle you'll be okay
	 * @type {() => Map<string, CacheEntry>}
	 */
	#get_cache;

	/** @type {string} */
	#prefix;

	/**
	 * @param {() => Map<string, CacheEntry>} get_cache
	 * @param {string} [prefix]
	 */
	constructor(get_cache, prefix = '') {
		this.#get_cache = get_cache;
		this.#prefix = prefix;
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
		for (const [key, entry] of this.entries()) {
			cb(entry, key, this);
		}
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

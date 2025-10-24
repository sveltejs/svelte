/** @implements {ReadonlyMap<string, any>} */
export class BaseCacheObserver {
	/** @type {ReadonlyMap<string, any>} */
	#cache;

	/** @param {Map<string, any>} cache */
	constructor(cache) {
		this.#cache = cache;
	}

	/** @type {ReadonlyMap<string, any>['get']} */
	get(key) {
		const entry = this.#cache.get(key);
		return entry?.item;
	}

	/** @type {ReadonlyMap<string, any>['has']} */
	has(key) {
		return this.#cache.has(key);
	}

	/** @type {ReadonlyMap<string, any>['size']} */
	get size() {
		return this.#cache.size;
	}

	/** @type {ReadonlyMap<string, any>['forEach']} */
	forEach(cb) {
		this.#cache.forEach((entry, key) => cb(entry.item, key, this));
	}

	/** @type {ReadonlyMap<string, any>['entries']} */
	*entries() {
		for (const [key, entry] of this.#cache.entries()) {
			yield [key, entry.item];
		}
	}

	/** @type {ReadonlyMap<string, any>['keys']} */
	*keys() {
		for (const key of this.#cache.keys()) {
			yield key;
		}
	}

	/** @type {ReadonlyMap<string, any>['values']} */
	*values() {
		for (const entry of this.#cache.values()) {
			yield entry.item;
		}
	}

	[Symbol.iterator]() {
		return this.entries();
	}
}

import { tick } from '../runtime.js';
import { render_effect } from './effects.js';

/** @typedef {{ count: number, item: any }} Entry */
/** @type {Map<string, Entry>} */
const client_cache = new Map();

/**
 * @template TReturn
 * @template {unknown} TArg
 * @param {string} name
 * @param {(arg: TArg, key: string) => TReturn} fn
 * @param {{ hash?: (arg: TArg) => string }} [options]
 * @returns {(arg: TArg) => TReturn}
 */
export function cache(name, fn, { hash = default_hash } = {}) {
	return (arg) => {
		const key = `${name}::::${hash(arg)}`;
		const cached = client_cache.has(key);
		const entry = client_cache.get(key);
		const maybe_remove = create_remover(key);

		let tracking = true;
		try {
			render_effect(() => {
				if (entry) entry.count++;
				return () => {
					const entry = client_cache.get(key);
					if (!entry) return;
					entry.count--;
					maybe_remove(entry);
				};
			});
		} catch {
			tracking = false;
		}

		if (cached) {
			return entry?.item;
		}

		const item = fn(arg, key);
		const new_entry = {
			item,
			count: tracking ? 1 : 0
		};
		client_cache.set(key, new_entry);

		Promise.resolve(item).then(
			() => maybe_remove(new_entry),
			() => maybe_remove(new_entry)
		);
		return item;
	};
}

/**
 * @param {string} key
 */
function create_remover(key) {
	/**
	 * @param {Entry | undefined} entry
	 */
	return (entry) =>
		tick().then(() => {
			if (!entry?.count && entry === client_cache.get(key)) {
				client_cache.delete(key);
			}
		});
}

/** @implements {ReadonlyMap<string, any>} */
class ReadonlyCache {
	/** @type {ReadonlyMap<string, any>['get']} */
	get(key) {
		const entry = client_cache.get(key);
		return entry?.item;
	}

	/** @type {ReadonlyMap<string, any>['has']} */
	has(key) {
		return client_cache.has(key);
	}

	/** @type {ReadonlyMap<string, any>['size']} */
	get size() {
		return client_cache.size;
	}

	/** @type {ReadonlyMap<string, any>['forEach']} */
	forEach(cb) {
		client_cache.forEach((entry, key) => cb(entry.item, key, this));
	}

	/** @type {ReadonlyMap<string, any>['entries']} */
	*entries() {
		for (const [key, entry] of client_cache.entries()) {
			yield [key, entry.item];
		}
	}

	/** @type {ReadonlyMap<string, any>['keys']} */
	*keys() {
		for (const key of client_cache.keys()) {
			yield key;
		}
	}

	/** @type {ReadonlyMap<string, any>['values']} */
	*values() {
		for (const entry of client_cache.values()) {
			yield entry.item;
		}
	}

	[Symbol.iterator]() {
		return this.entries();
	}
}

const readonly_cache = new ReadonlyCache();

/** @returns {ReadonlyMap<string, any>} */
export function get_cache() {
	return readonly_cache;
}

/**
 * @param  {...any} args
 * @returns
 */
function default_hash(...args) {
	return JSON.stringify(args);
}

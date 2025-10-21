import { get_render_store } from '../context';

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
		const cache = get_render_store().cache;
		const key = `${name}::::${hash(arg)}`;
		const entry = cache.get(key);
		if (entry) {
			return /** @type {TReturn} */ (entry);
		}
		const new_entry = fn(arg, key);
		cache.set(key, new_entry);
		return new_entry;
	};
}

/**
 * @param {any} arg
 * @returns {string}
 */
function default_hash(arg) {
	return JSON.stringify(arg);
}

export function get_cache() {
	throw new Error('TODO: cannot get cache on the server');
}

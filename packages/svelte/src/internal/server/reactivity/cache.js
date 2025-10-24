import { BaseCacheObserver } from '../../shared/cache-observer';
import { get_render_store, set_hydratable_key } from '../context';

/**
 * @template {(...args: any[]) => any} TFn
 * @param {string} key
 * @param {TFn} fn
 * @returns {ReturnType<TFn>}
 */
export function cache(key, fn) {
	const cache = get_render_store().cache;
	const entry = cache.get(key);
	if (entry) {
		return /** @type {ReturnType<TFn>} */ (entry);
	}
	set_hydratable_key(key);
	const new_entry = fn();
	set_hydratable_key(null);
	cache.set(key, new_entry);
	return new_entry;
}

export class CacheObserver extends BaseCacheObserver {
	constructor() {
		super(get_render_store().cache);
	}
}

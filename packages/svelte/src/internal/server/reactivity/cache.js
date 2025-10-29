import { BaseCacheObserver } from '../../shared/cache-observer.js';
import { set_hydratable_key } from '../hydratable.js';
import { get_render_context } from '../render-context.js';

/**
 * @template {(...args: any[]) => any} TFn
 * @param {string} key
 * @param {TFn} fn
 * @returns {ReturnType<TFn>}
 */
export function cache(key, fn) {
	const cache = get_render_context().cache;
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

/**
 * @template T
 * @extends BaseCacheObserver<T>
 */
export class CacheObserver extends BaseCacheObserver {
	constructor(prefix = '') {
		super(() => get_render_context().cache, prefix);
	}
}

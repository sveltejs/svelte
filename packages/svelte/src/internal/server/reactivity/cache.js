import { async_mode_flag } from '../../flags/index.js';
import { BaseCacheObserver } from '../../shared/cache-observer.js';
import { get_render_context } from '../render-context.js';
import * as e from '../errors.js';

/**
 * @template {(...args: any[]) => any} TFn
 * @param {string} key
 * @param {TFn} fn
 * @returns {ReturnType<TFn>}
 */
export function cache(key, fn) {
	if (!async_mode_flag) {
		e.experimental_async_required('cache');
	}

	const cache = get_render_context().cache;
	const entry = cache.get(key);
	if (entry) {
		return /** @type {ReturnType<TFn>} */ (entry);
	}
	const new_entry = fn();
	cache.set(key, new_entry);
	return new_entry;
}

/**
 * @template T
 * @extends BaseCacheObserver<T>
 */
export class CacheObserver extends BaseCacheObserver {
	constructor(prefix = '') {
		if (!async_mode_flag) {
			e.experimental_async_required('CacheObserver');
		}
		super(() => get_render_context().cache, prefix);
	}
}

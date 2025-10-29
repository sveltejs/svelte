import { set_hydratable_key } from '../hydratable';
import { get_render_context } from '../render-context';

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

// TODO, has to be async
// export class CacheObserver extends BaseCacheObserver {
// 	constructor() {
// 		super(get_render_store().cache);
// 	}
// }

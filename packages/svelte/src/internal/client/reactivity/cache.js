import { BaseCacheObserver } from '../../shared/cache-observer.js';
import { ObservableCache } from '../../shared/observable-cache.js';
import { set_hydratable_key } from '../context.js';
import { tick } from '../runtime.js';
import { render_effect } from './effects.js';

/** @typedef {{ count: number, item: any }} Entry */
/** @type {ObservableCache} */
const client_cache = new ObservableCache();

/**
 * @template {(...args: any[]) => any} TFn
 * @param {string} key
 * @param {TFn} fn
 * @returns {ReturnType<TFn>}
 */
export function cache(key, fn) {
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

	set_hydratable_key(key);
	const item = fn();
	set_hydratable_key(null);
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

/**
 * @template T
 * @extends BaseCacheObserver<T>
 */
export class CacheObserver extends BaseCacheObserver {
	constructor(prefix = '') {
		super(() => client_cache, prefix);
	}
}

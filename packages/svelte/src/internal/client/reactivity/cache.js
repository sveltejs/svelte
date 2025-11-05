/** @import { CacheEntry } from '#shared' */
import { async_mode_flag } from '../../flags/index.js';
import { BaseCacheObserver } from '../../shared/cache-observer.js';
import { tick } from '../runtime.js';
import { get_effect_validation_error_code, render_effect } from './effects.js';
import * as e from '../errors.js';

/** @typedef {{ count: number, item: any }} Entry */
/** @type {Map<string, CacheEntry>} */
const client_cache = new Map();

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

	const cached = client_cache.has(key);
	const entry = client_cache.get(key);
	const maybe_remove = create_remover(key);

	const tracking = get_effect_validation_error_code() === null;
	if (tracking) {
		render_effect(() => {
			if (entry) entry.count++;
			return () => {
				const entry = client_cache.get(key);
				if (!entry) return;
				entry.count--;
				maybe_remove(entry);
			};
		});
	}

	if (cached) {
		return entry?.item;
	}

	const item = fn();
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
		if (!async_mode_flag) {
			e.experimental_async_required('CacheObserver');
		}
		super(() => client_cache, prefix);
	}
}

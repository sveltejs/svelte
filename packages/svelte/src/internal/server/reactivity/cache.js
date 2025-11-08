import { async_mode_flag } from '../../flags/index.js';
import * as e from '../errors.js';
import { get_render_context } from '../render-context.js';

/** @template T */
export class ReactiveCache {
	#key = Symbol('ReactiveCache');

	constructor() {
		if (!async_mode_flag) {
			e.experimental_async_required('ReactiveCache');
		}
	}

	/**
	 * @param {string} key
	 * @param {() => T} fn
	 * @returns {T}
	 */
	register(key, fn) {
		const cache = this.#get_cache();
		let entry = cache.get(key);

		if (!entry) {
			entry = fn();
			cache.set(key, entry);
		}

		return entry;
	}

	[Symbol.iterator]() {
		return this.#get_cache().values();
	}

	#get_cache() {
		const store = get_render_context();
		let map = store.cache.get(this.#key);
		if (map === undefined) {
			store.cache.set(this.#key, (map = new Map()));
		}
		return map;
	}
}

/** @import { CacheEntry } from '#shared' */
import { async_mode_flag } from '../../flags/index.js';
import { active_effect, is_destroying_effect, tick } from '../runtime.js';
import { render_effect } from './effects.js';
import * as e from '../errors.js';

/** @template T */
export class ReactiveCache {
	/** @type {Map<string, CacheEntry<T>>} */
	#cache = new Map();

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
		let entry = this.#cache.get(key);

		if (!entry) {
			entry = { count: 0, item: fn() };
			this.#cache.set(key, entry);
		}

		const maybe_remove = () => {
			tick().then(() => {
				if (entry.count === 0 && this.#cache.get(key) === entry) {
					this.#cache.delete(key);
				}
			});
		};

		if (active_effect !== null && !is_destroying_effect) {
			render_effect(() => {
				entry.count++;

				return () => {
					entry.count--;
					maybe_remove();
				};
			});
		} else {
			throw new Error('TODO must be called from within a reactive context');
		}

		return entry.item;
	}

	*[Symbol.iterator]() {
		for (const entry of this.#cache.values()) {
			yield entry.item;
		}
	}
}

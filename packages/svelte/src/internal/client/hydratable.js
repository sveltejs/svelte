import { async_mode_flag } from '../flags/index.js';
import { hydrating } from './dom/hydration.js';
import * as w from './warnings.js';
import * as e from './errors.js';
import { DEV } from 'esm-env';

/**
 * @template T
 * @param {string} key
 * @param {() => T} fn
 * @returns {T}
 */
export function hydratable(key, fn) {
	if (!async_mode_flag) {
		e.experimental_async_required('hydratable');
	}

	if (hydrating) {
		const store = window.__svelte?.h;

		if (store?.has(key)) {
			return /** @type {T} */ (store.get(key));
		}

		if (DEV) {
			e.hydratable_missing_but_required(key);
		} else {
			w.hydratable_missing_but_expected(key);
		}
	}

	return fn();
}

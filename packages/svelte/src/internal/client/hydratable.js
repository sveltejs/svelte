import { async_mode_flag } from '../flags/index.js';
import { hydrating } from './dom/hydration.js';
import { Warp } from './warp.js';
import * as w from './warnings.js';
import * as e from './errors.js';
import { DEV } from 'esm-env';

/** @type {Warp<string, any>} */
const warp = new Warp('svelte:hydratable');

/**
 * @deprecated Use [`Warp`](https://svelte.dev/docs/svelte/warp) instead
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
		if (warp.has(key)) {
			return warp.get(key);
		}

		if (DEV) {
			e.hydratable_missing_but_required(key);
		} else {
			w.hydratable_missing_but_expected(key);
		}
	}

	return fn();
}

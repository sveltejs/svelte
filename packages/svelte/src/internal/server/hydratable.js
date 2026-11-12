import { async_mode_flag } from '../flags/index.js';
import { Warp } from './warp.js';
import * as e from './errors.js';

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

	return warp.getOrInsertComputed(key, fn);
}

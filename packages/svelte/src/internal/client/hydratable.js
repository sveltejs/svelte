/** @import { Decode, Transport } from '#shared' */
import { async_mode_flag } from '../flags/index.js';
import { hydrating } from './dom/hydration.js';
import * as w from './warnings.js';
import * as e from './errors.js';
import { DEV } from 'esm-env';

/**
 * @template T
 * @param {string} key
 * @param {() => T} fn
 * @param {Transport<T>} [transport]
 * @returns {T}
 */
export function hydratable(key, fn, transport) {
	if (!async_mode_flag) {
		e.experimental_async_required('hydratable');
	}

	if (!hydrating) {
		return fn();
	}

	const store = window.__svelte?.h;
	const unused_keys = window.__svelte?.uh;
	if (!store?.has(key)) {
		if (!unused_keys?.has(key)) {
			hydratable_missing_but_expected(key);
		}
		return fn();
	}

	return decode(store?.get(key), transport?.decode);
}

/**
 * @template T
 * @param {unknown} val
 * @param {Decode<T> | undefined} decode
 * @returns {T}
 */
function decode(val, decode) {
	return (decode ?? ((val) => /** @type {T} */ (val)))(val);
}

/** @param {string} key */
function hydratable_missing_but_expected(key) {
	if (DEV) {
		e.hydratable_missing_but_expected_e(key);
	} else {
		w.hydratable_missing_but_expected_w(key);
	}
}

/** @import { Decode, Transport } from '#shared' */
import { async_mode_flag } from '../flags/index.js';
import { hydrating } from './dom/hydration.js';
import * as w from './warnings.js';
import * as e from './errors.js';

/**
 * @template T
 * @param {string} key
 * @param {() => T} fn
 * @param {Transport<T>} [options]
 * @returns {T}
 */
export function hydratable(key, fn, options) {
	if (!async_mode_flag) {
		e.experimental_async_required('hydratable');
	}

	return access_hydratable_store(
		key,
		(val, has) => {
			if (!has) {
				w.hydratable_missing_but_expected(key);
			}
			return decode(val, options?.decode);
		},
		fn
	);
}

/**
 * @template T
 * @param {string} key
 * @param {{ decode?: Decode<T> }} [options]
 * @returns {T | undefined}
 */
export function get_hydratable_value(key, options = {}) {
	if (!async_mode_flag) {
		e.experimental_async_required('getHydratableValue');
	}

	return access_hydratable_store(
		key,
		(val) => decode(val, options.decode),
		() => undefined
	);
}

/**
 * @param {string} key
 * @returns {boolean}
 */
export function has_hydratable_value(key) {
	if (!async_mode_flag) {
		e.experimental_async_required('hasHydratableValue');
	}
	return access_hydratable_store(
		key,
		(_, has) => has,
		() => false
	);
}

/**
 * @template T
 * @param {string} key
 * @param {(val: unknown, has: boolean) => T} on_hydrating
 * @param {() => T} on_not_hydrating
 * @returns {T}
 */
function access_hydratable_store(key, on_hydrating, on_not_hydrating) {
	if (!hydrating) {
		return on_not_hydrating();
	}
	var store = window.__svelte?.h;
	return on_hydrating(store?.get(key), store?.has(key) ?? false);
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

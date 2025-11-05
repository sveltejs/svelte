/** @import { Decode, Transport } from '#shared' */
import { hydrating } from './dom/hydration.js';

/**
 * @template T
 * @param {string} key
 * @param {() => T} fn
 * @param {{ transport?: Transport<T> }} [options]
 * @returns {T}
 */
export function hydratable(key, fn, options = {}) {
	if (!hydrating) {
		return fn();
	}
	var store = window.__svelte?.h;
	const val = store?.get(key);
	if (val === undefined) {
		// TODO this should really be an error or at least a warning because it would be disastrous to expect
		// something to be synchronously hydratable and then have it not be
		return fn();
	}
	return decode(val, options.transport?.decode);
}

/**
 * @template T
 * @param {string} key
 * @param {{ decode?: Decode<T> }} [options]
 * @returns {T | undefined}
 */
export function get_hydratable_value(key, options = {}) {
	// TODO probably can DRY this out with the above
	if (!hydrating) {
		return undefined;
	}

	var store = window.__svelte?.h;
	const val = store?.get(key);
	if (val === undefined) {
		return undefined;
	}

	return decode(val, options.decode);
}

/**
 * @param {string} key
 * @returns {boolean}
 */
export function has_hydratable_value(key) {
	if (!hydrating) {
		return false;
	}
	var store = window.__svelte?.h;
	return store?.has(key) ?? false;
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

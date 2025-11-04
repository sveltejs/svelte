/** @import { Parse, Transport } from '#shared' */
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
	return parse(val, options.transport?.parse);
}

/**
 * @template T
 * @param {string} key
 * @param {{ parse?: Parse<T> }} [options]
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

	return parse(val, options.parse);
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
 * @param {string} val
 * @param {Parse<T> | undefined} parse
 * @returns {T}
 */
function parse(val, parse) {
	return (parse ?? ((val) => new Function(`return (${val})`)()))(val);
}

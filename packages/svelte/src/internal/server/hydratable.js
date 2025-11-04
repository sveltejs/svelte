/** @import { Stringify, Transport } from '#shared' */

import { get_render_context } from './render-context.js';

/** @type {string | null} */
export let hydratable_key = null;

/** @param {string | null} key */
export function set_hydratable_key(key) {
	hydratable_key = key;
}

/**
 * @template T
 * @param {string} key
 * @param {() => T} fn
 * @param {{ transport?: Transport<T> }} [options]
 * @returns {T}
 */
export function hydratable(key, fn, options = {}) {
	const store = get_render_context();

	if (store.hydratables.has(key)) {
		// TODO error
		throw new Error("can't have two hydratables with the same key");
	}

	const result = fn();
	store.hydratables.set(key, { value: result, stringify: options.transport?.stringify });
	return result;
}
/**
 * @template T
 * @param {string} key
 * @param {T} value
 * @param {{ stringify?: Stringify<T> }} [options]
 */
export function set_hydratable_value(key, value, options = {}) {
	const store = get_render_context();

	if (store.hydratables.has(key)) {
		// TODO error
		throw new Error("can't have two hydratables with the same key");
	}

	store.hydratables.set(key, {
		value,
		stringify: options.stringify
	});
}

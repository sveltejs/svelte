/** @import { Transport } from '#shared' */

import { get_render_context } from './render-context';

/** @type {string | null} */
export let hydratable_key = null;

/** @param {string | null} key */
export function set_hydratable_key(key) {
	hydratable_key = key;
}

/**
 * @template T
 * @overload
 * @param {string} key
 * @param {() => Promise<T>} fn
 * @param {{ transport?: Transport<T> }} [options]
 * @returns {Promise<T>}
 */
/**
 * @template T
 * @overload
 * @param {() => Promise<T>} fn
 * @param {{ transport?: Transport<T> }} [options]
 * @returns {Promise<T>}
 */
/**
 * @template T
 * @param {string | (() => Promise<T>)} key_or_fn
 * @param {(() => Promise<T>) | { transport?: Transport<T> }} [fn_or_options]
 * @param {{ transport?: Transport<T> }} [maybe_options]
 * @returns {Promise<T>}
 */
export async function hydratable(key_or_fn, fn_or_options = {}, maybe_options = {}) {
	// TODO DRY out with #shared
	/** @type {string} */
	let key;
	/** @type {() => Promise<T>} */
	let fn;
	/** @type {{ transport?: Transport<T> }} */
	let options;

	if (typeof key_or_fn === 'string') {
		key = key_or_fn;
		fn = /** @type {() => Promise<T>} */ (fn_or_options);
		options = /** @type {{ transport?: Transport<T> }} */ (maybe_options);
	} else {
		if (hydratable_key === null) {
			throw new Error(
				'TODO error: `hydratable` must be called synchronously within `cache` in order to omit the key'
			);
		} else {
			key = hydratable_key;
		}
		fn = /** @type {() => Promise<T>} */ (key_or_fn);
		options = /** @type {{ transport?: Transport<T> }} */ (fn_or_options);
	}
	const store = await get_render_context();

	if (store.hydratables.has(key)) {
		// TODO error
		throw new Error("can't have two hydratables with the same key");
	}

	const result = fn();
	store.hydratables.set(key, { value: result, transport: options.transport });
	return result;
}

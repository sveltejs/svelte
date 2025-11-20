/** @import { HydratableContext, HydratableLookupEntry } from '#server' */
import { async_mode_flag } from '../flags/index.js';
import { get_render_context } from './render-context.js';
import * as e from './errors.js';
import { uneval } from 'devalue';
import { get_stack } from './dev.js';
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

	const store = get_render_context();

	const existing_entry = store.hydratable.lookup.get(key);
	if (existing_entry !== undefined) {
		return /** @type {T} */ (existing_entry.value);
	}

	const result = fn();
	/** @type {HydratableLookupEntry} */
	const entry = {
		value: result,
		root_index: encode(result, key, store.hydratable)
	};

	if (DEV) {
		entry.stack = get_stack(`hydratable"`)?.stack;
	}

	store.hydratable.lookup.set(key, entry);

	return result;
}

/**
 * @param {unknown} value
 * @param {string} key
 * @param {HydratableContext} hydratable_context
 * @returns {number}
 */
function encode(value, key, hydratable_context) {
	const replacer = create_replacer(key, hydratable_context);
	return hydratable_context.values.push(uneval(value, replacer)) - 1;
}

/**
 * @param {string} key
 * @param {HydratableContext} hydratable_context
 * @returns {(value: unknown, uneval: (value: any) => string) => string | undefined}
 */
function create_replacer(key, hydratable_context) {
	/**
	 * @param {unknown} value
	 */
	const replacer = (value) => {
		if (value instanceof Promise) {
			// use the root-level uneval because we need a separate, top-level entry for each promise
			/** @type {Promise<string>} */
			const serialize_promise = value.then((v) => `r(${uneval(v, replacer)})`);
			hydratable_context.unresolved_promises.set(serialize_promise, key);
			serialize_promise.finally(() =>
				hydratable_context.unresolved_promises.delete(serialize_promise)
			);
			const index = hydratable_context.values.push(serialize_promise) - 1;
			return `d(${index})`;
		}
	};

	return replacer;
}

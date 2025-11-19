/** @import { HydratableContext } from '#server' */
import { async_mode_flag } from '../flags/index.js';
import { get_render_context } from './render-context.js';
import * as e from './errors.js';
import { uneval } from 'devalue';

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

	const entry = store.hydratable.lookup.get(key);
	if (entry !== undefined) {
		return /** @type {T} */ (entry.value);
	}

	const result = fn();
	store.hydratable.lookup.set(key, {
		value: result,
		root_index: encode(result, key, store.hydratable)
	});

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
	 * @param {(value: any) => string} inner_uneval
	 */
	const replacer = (value, inner_uneval) => {
		if (value instanceof Promise) {
			hydratable_context.unresolved_promises.set(value, key);
			value.finally(() => hydratable_context.unresolved_promises.delete(value));
			// use the root-level uneval because we need a separate, top-level entry for each promise
			const index =
				hydratable_context.values.push(value.then((v) => `r(${uneval(v, replacer)})`)) - 1;
			return `d(${index})`;
		}
	};

	return replacer;
}

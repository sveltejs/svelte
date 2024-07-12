/** @import { Snippet } from 'svelte' */
/** @import { Payload } from '#server' */
/** @import { Getters } from '#shared' */
import { add_snippet_symbol } from '../../shared/validate.js';

/**
 * Create a snippet programmatically
 * @template {unknown[]} Params
 * @param {{
 *   render: (...params: Params) => string
 *   update?: (element: Element, ...params: Getters<Params>) => void,
 * }} options
 * @returns {Snippet<Params>}
 */
export function createRawSnippet({ render }) {
	const snippet_fn = (/** @type {Payload} */ payload, /** @type {Params} */ ...args) => {
		payload.out += render(...args);
	};
	add_snippet_symbol(snippet_fn);
	return /** @type {Snippet} */ (snippet_fn);
}

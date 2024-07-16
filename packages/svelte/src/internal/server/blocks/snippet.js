/** @import { Snippet } from 'svelte' */
/** @import { Payload } from '#server' */
/** @import { Getters } from '#shared' */
import { add_snippet_symbol } from '../../shared/validate.js';

/**
 * Create a snippet programmatically
 * @template {unknown[]} Params
 * @param {(...params: Getters<Params>) => {
 *   render: () => string
 *   setup?: (element: Element) => void
 * }} fn
 * @returns {Snippet<Params>}
 */
export function createRawSnippet(fn) {
	return add_snippet_symbol((/** @type {Payload} */ payload, /** @type {Params} */ ...args) => {
		var getters = /** @type {Getters<Params>} */ (args.map((value) => () => value));
		payload.out += fn(...getters)
			.render()
			.trim();
	});
}

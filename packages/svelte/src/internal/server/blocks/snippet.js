/** @import { Snippet } from 'svelte' */
/** @import { Payload } from '#server' */
/** @import { Getters } from '#shared' */

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
	return (payload, ...args) => {
		var getters = /** @type {Getters<Params>} */ (args.map((value) => () => value));
		/** @type {Payload} */ (/** @type {unknown} */ (payload)).out += fn(...getters)
			.render()
			.trim();
	};
}

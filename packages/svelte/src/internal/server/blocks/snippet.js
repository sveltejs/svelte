/** @import { Payload } from '#server' */
import { add_snippet_symbol } from '../../shared/validate.js';
import * as e from '../errors.js';

/**
 * Create a snippet imperatively using mount, hyrdate and render functions.
 * @param {{
 * 	 mount?: (...params: any[]) => Element,
 *   hydrate?: (element: Element, ...params: any[]) => void,
 *   render?: (...params: any[]) => string
 * }} options
 */
export function createRawSnippet({ render }) {
	if (render === undefined) {
		e.snippet_missing_render();
	}

	const snippet_fn = (/** @type {Payload} */ payload, /** @type {any[]} */ ...args) => {
		payload.out += render(...args);
	};
	add_snippet_symbol(snippet_fn);
	return snippet_fn;
}

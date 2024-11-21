/** @import { Payload } from '#server' */

import { escape_html } from '../../../escaping.js';

/**
 * @param {Payload} payload
 * @param {Record<string, string>} attributes
 */
export function svelte_html(payload, attributes) {
	for (const name in attributes) {
		payload.htmlAttributes.set(name, escape_html(attributes[name], true));
	}
}

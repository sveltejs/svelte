/** @import { Payload } from '#server' */

import { escape_html } from '../../../escaping.js';
import { svelte_html_duplicate_attribute } from '../../shared/warnings.js';

/**
 * @param {Payload} payload
 * @param {Record<string, string>} attributes
 */
export function svelte_html(payload, attributes) {
	for (const name in attributes) {
		if (payload.htmlAttributes.has(name)) {
			svelte_html_duplicate_attribute(name);
		}
		payload.htmlAttributes.set(name, escape_html(attributes[name], true));
	}
}

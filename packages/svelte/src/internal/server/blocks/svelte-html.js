/** @import { Payload } from '#server' */

import { svelte_html_duplicate_attribute } from '../../shared/warnings.js';

/**
 * @param {Payload} payload
 * @param {Record<string, string>} attributes
 */
export function svelte_html(payload, attributes) {
	for (const name in attributes) {
		let value = attributes[name];

		if (payload.htmlAttributes.has(name)) {
			if (name === 'class') {
				// Don't bother deduplicating class names, the browser handles it just fine
				value = `${payload.htmlAttributes.get(name)} ${value}`.trim();
			} else {
				svelte_html_duplicate_attribute(name);
			}
		}

		payload.htmlAttributes.set(name, value);
	}
}

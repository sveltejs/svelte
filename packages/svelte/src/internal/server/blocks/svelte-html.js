/** @import { Payload } from '#server' */

import { escape } from '..';

/**
 * @param {Payload} payload
 * @param {Record<string, string>} attributes
 */
export function svelte_html(payload, attributes) {
	for (const name in attributes) {
		payload.htmlAttributes.set(name, escape(attributes[name], true));
	}
}

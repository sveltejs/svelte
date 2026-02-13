/** @import {} from 'trusted-types' */

import { create_element } from './operations.js';

const policy = /* @__PURE__ */ globalThis?.window?.trustedTypes?.createPolicy(
	'svelte-trusted-html',
	{
		/** @param {string} html */
		createHTML: (html) => {
			return html;
		}
	}
);

/** @param {string} html */
function create_trusted_html(html) {
	return /** @type {string} */ (policy?.createHTML(html) ?? html);
}

/**
 * @param {string} html
 * @param {boolean} trusted
 */
export function create_fragment_from_html(html, trusted = false) {
	var elem = create_element('template');
	html = html.replaceAll('<!>', '<!---->'); // XHTML compliance
	elem.innerHTML = trusted ? create_trusted_html(html) : html;
	return elem.content;
}

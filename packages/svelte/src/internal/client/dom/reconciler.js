/** @import { TrustedTypePolicy } from 'trusted-types' */

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
 * @param {boolean} untrusted
 */
export function create_fragment_from_html(html, untrusted = false) {
	var elem = document.createElement('template');
	html = html.replaceAll('<!>', '<!---->'); // XHTML compliance
	elem.innerHTML = untrusted ? html : create_trusted_html(html);
	return elem.content;
}

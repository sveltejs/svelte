import { create_element } from './operations.js';

const policy =
	// We gotta write it like this because after downleveling the pure comment may end up in the wrong location
	globalThis?.window?.trustedTypes &&
	/* @__PURE__ */ globalThis.window.trustedTypes.createPolicy('svelte-trusted-html', {
		/** @param {string} html */
		createHTML: (html) => {
			return html;
		}
	});

/** @param {string} html */
export function create_trusted_html(html) {
	return /** @type {string} */ (policy?.createHTML(html) ?? html);
}

/**
 * @param {string} html
 */
export function create_fragment_from_html(html) {
	var elem = create_element('template');
	elem.innerHTML = create_trusted_html(html.replaceAll('<!>', '<!---->')); // XHTML compliance
	return elem.content;
}

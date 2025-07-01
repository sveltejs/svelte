/** @import { TrustedTypePolicy } from 'trusted-types' */

/** @type {Pick<TrustedTypePolicy, 'createHTML'> | undefined} */
let policy;

if (globalThis?.window?.trustedTypes) {
	policy = globalThis.window.trustedTypes.createPolicy('svelte-trusted-html', {
		/** @param {string} html */
		createHTML: (html) => {
			return html;
		}
	});
}

/** @param {string} html */
function create_trusted_html(html) {
	return /** @type {string} */(policy?.createHTML(html) ?? html);
}

/** @param {string} html */
export function create_fragment_from_html(html) {
	var elem = document.createElement('template');
	elem.innerHTML = create_trusted_html(html.replaceAll('<!>', '<!---->')); // XHTML compliance
	return elem.content;
}

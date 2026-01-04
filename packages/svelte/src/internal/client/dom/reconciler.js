import { NAMESPACE_HTML } from '../../../constants.js';

/** @param {string} html */
export function create_fragment_from_html(html) {
	var elem = document.createElementNS(NAMESPACE_HTML, 'template');
	elem.innerHTML = html.replaceAll('<!>', '<!---->'); // XHTML compliance
	return elem.content;
}

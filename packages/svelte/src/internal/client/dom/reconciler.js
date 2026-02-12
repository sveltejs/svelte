import { create_element } from './operations.js';

/** @param {string} html */
export function create_fragment_from_html(html) {
	var elem = create_element('template');
	elem.innerHTML = html.replaceAll('<!>', '<!---->'); // XHTML compliance
	return elem.content;
}

/** @param {string} html */
export function create_fragment_from_html(html) {
	var elem = document.createElement('template');
	elem.innerHTML = html.replaceAll('<!>', '<!---->'); // XHTML compliance
	return elem.content;
}

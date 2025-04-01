import { DEV } from 'esm-env';
import * as w from '../warnings.js';

/**
 *  @param {string} html
 */
export function create_fragment_from_html(html) {
	var elem = document.createElement('template');
	elem.innerHTML = html;
	if (DEV) {
		let replace_comments = html.replaceAll('<!>', '<!---->');
		let remove_attributes_and_text_input = replace_comments
			// we remove every attribute since the template automatically adds ="" after boolean attributes
			.replace(/<([a-z0-9]+)(\s+[^>]+?)?>/g, '<$1>')
			// we remove the text within the elements because the template change & to &amp; (and similar)
			.replace(/>([^<>]*)/g, '>');
		let remove_attributes_and_text_output = elem.innerHTML
			// we remove every attribute since the template automatically adds ="" after boolean attributes
			.replace(/<([a-z0-9]+)(\s+[^>]+?)?>/g, '<$1>')
			// we remove the text within the elements because the template change & to &amp; (and similar)
			.replace(/>([^<>]*)/g, '>');
		if (remove_attributes_and_text_input !== remove_attributes_and_text_output) {
			w.invalid_html_structure(remove_attributes_and_text_input, remove_attributes_and_text_output);
		}
	}

	return elem.content;
}

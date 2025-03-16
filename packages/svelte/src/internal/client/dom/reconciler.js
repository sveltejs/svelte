import { DEV } from 'esm-env';
import * as e from '../errors.js';

/**
 *  @param {string} html
 *  @param {boolean} [check_structure]
 */
export function create_fragment_from_html(html, check_structure = true) {
	var elem = document.createElement('template');
	elem.innerHTML = html;
	if (DEV && check_structure) {
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
			e.invalid_html_structure(remove_attributes_and_text_input, remove_attributes_and_text_output);
		}
	}

	return elem.content;
}

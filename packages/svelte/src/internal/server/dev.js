import {
	disallowed_paragraph_contents,
	interactive_elements,
	is_tag_valid_with_parent
} from '../../constants.js';
import { current_component } from './context.js';

/**
 * @typedef {{
 * 	tag: string;
 * 	parent: null | Element;
 *  filename: null | string;
 * }} Element
 */

/**
 * @type {Element | null}
 */
let parent = null;

/**
 * @param {import('#server').Payload} payload
 * @param {string} message
 */
function error_on_client(payload, message) {
	message =
		`Svelte SSR validation error:\n\n${message}\n\n` +
		'Ensure your components render valid HTML as the browser will try to repair invalid HTML, ' +
		'which may result in content being shifted around and will likely result in a hydration mismatch.';
	// eslint-disable-next-line no-console
	console.error(message);
	payload.head.out += `<script>console.error(\`${message}\`)</script>`;
}

/**
 * @param {string | null} file
 */
function print_file(file) {
	return file ? `(${file})` : '';
}

/**
 * @param {import('#server').Payload} payload
 * @param {Element} parent
 * @param {Element} child
 */
function print_error(payload, parent, child) {
	error_on_client(
		payload,
		`<${child.tag}> ${print_file(child.filename)} is not a valid child element of <${parent.tag}> ${print_file(parent.filename)}`
	);
}

/**
 * @param {import('#server').Payload} payload
 * @param {string} tag
 * @param {number} line
 * @param {number} column
 */
export function push_element(payload, tag, line, column) {
	var filename = /** @type {import('#server').Component} */ (current_component).function.filename;
	var child = { tag, parent, filename };

	if (parent !== null && !is_tag_valid_with_parent(tag, parent.tag)) {
		print_error(payload, parent, child);
	}

	if (interactive_elements.has(tag)) {
		let element = parent;
		while (element !== null) {
			if (interactive_elements.has(element.tag)) {
				print_error(payload, element, child);
				break;
			}
			element = element.parent;
		}
	}

	if (disallowed_paragraph_contents.includes(tag)) {
		let element = parent;
		while (element !== null) {
			if (element.tag === 'p') {
				print_error(payload, element, child);
				break;
			}
			element = element.parent;
		}
	}

	parent = child;
}

export function pop_element() {
	parent = /** @type {Element} */ (parent).parent;
}

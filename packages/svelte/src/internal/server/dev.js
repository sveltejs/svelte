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
 *  line: number;
 *  column: number;
 * }} Element
 */

/**
 * @type {Element | null}
 */
let parent = null;

/** @type {Set<string>} */
let seen;

/**
 * @param {Element} element
 */
function stringify(element) {
	if (element.filename === null) return `\`<${element.tag}>\``;
	return `\`<${element.tag}>\` (${element.filename}:${element.line}:${element.column})`;
}

/**
 * @param {import('#server').Payload} payload
 * @param {Element} parent
 * @param {Element} child
 */
function print_error(payload, parent, child) {
	var message =
		`${stringify(parent)} cannot contain ${stringify(child)}\n\n` +
		'This can cause content to shift around as the browser repairs the HTML, and will likely result in a `hydration_mismatch` warning.';

	if ((seen ??= new Set()).has(message)) return;
	seen.add(message);

	// eslint-disable-next-line no-console
	console.error(message);
	payload.head.out += `<script>console.error(${JSON.stringify(message)})</script>`;
}

/**
 * @param {import('#server').Payload} payload
 * @param {string} tag
 * @param {number} line
 * @param {number} column
 */
export function push_element(payload, tag, line, column) {
	var filename = /** @type {import('#server').Component} */ (current_component).function.filename;
	var child = { tag, parent, filename, line, column };

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

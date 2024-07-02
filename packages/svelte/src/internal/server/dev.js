import { disallowed_parents } from '../../compiler/utils/html.js';
import { is_tag_valid_with_parent } from '../../constants.js';
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
		`${stringify(child)} cannot contain ${stringify(parent)}\n\n` +
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

	if (tag in disallowed_parents) {
		const parents = disallowed_parents[tag];

		let element = parent;
		while (element !== null) {
			if (parents.includes(element.tag)) {
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

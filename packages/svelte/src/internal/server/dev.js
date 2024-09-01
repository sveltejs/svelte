/** @import { Component, Payload } from '#server' */
import { FILENAME } from '../../constants.js';
import {
	is_tag_valid_with_ancestor,
	is_tag_valid_with_parent
} from '../../html-tree-validation.js';
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
 * @param {Payload} payload
 * @param {Element} parent
 * @param {Element} child
 */
function print_error(payload, parent, child) {
	var message =
		`node_invalid_placement_ssr: ${stringify(parent)} cannot contain ${stringify(child)}\n\n` +
		'This can cause content to shift around as the browser repairs the HTML, and will likely result in a `hydration_mismatch` warning.';

	if ((seen ??= new Set()).has(message)) return;
	seen.add(message);

	// eslint-disable-next-line no-console
	console.error(message);
	payload.head.out += `<script>console.error(${JSON.stringify(message)})</script>`;
}

export function reset_elements() {
	parent = null;
}

/**
 * @param {Payload} payload
 * @param {string} tag
 * @param {number} line
 * @param {number} column
 */
export function push_element(payload, tag, line, column) {
	var filename = /** @type {Component} */ (current_component).function[FILENAME];
	var child = { tag, parent, filename, line, column };

	if (parent !== null) {
		var ancestor = parent.parent;
		var ancestors = [parent.tag];

		if (!is_tag_valid_with_parent(tag, parent.tag)) {
			print_error(payload, parent, child);
		}

		while (ancestor != null) {
			ancestors.push(ancestor.tag);
			if (!is_tag_valid_with_ancestor(tag, ancestors)) {
				print_error(payload, ancestor, child);
			}
			ancestor = ancestor.parent;
		}
	}

	parent = child;
}

export function pop_element() {
	parent = /** @type {Element} */ (parent).parent;
}

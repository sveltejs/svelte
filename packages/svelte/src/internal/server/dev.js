/** @import { Component } from '#server' */
import { FILENAME } from '../../constants.js';
import {
	is_tag_valid_with_ancestor,
	is_tag_valid_with_parent
} from '../../html-tree-validation.js';
import { current_component } from './context.js';
import { invalid_snippet_arguments } from '../shared/errors.js';
import { HeadPayload, Payload } from './payload.js';

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
 * @param {Payload} payload
 * @param {string} message
 */
function print_error(payload, message) {
	message =
		`node_invalid_placement_ssr: ${message}\n\n` +
		'This can cause content to shift around as the browser repairs the HTML, and will likely result in a `hydration_mismatch` warning.';

	if ((seen ??= new Set()).has(message)) return;
	seen.add(message);

	// eslint-disable-next-line no-console
	console.error(message);
	payload.head.out += `<script>console.error(${JSON.stringify(message)})</script>`;
}

export function reset_elements() {
	let old_parent = parent;
	parent = null;
	return () => {
		parent = old_parent;
	};
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

		const child_loc = filename ? `${filename}:${line}:${column}` : undefined;
		const parent_loc = parent.filename
			? `${parent.filename}:${parent.line}:${parent.column}`
			: undefined;

		const message = is_tag_valid_with_parent(tag, parent.tag, child_loc, parent_loc);
		if (message) print_error(payload, message);

		while (ancestor != null) {
			ancestors.push(ancestor.tag);
			const ancestor_loc = ancestor.filename
				? `${ancestor.filename}:${ancestor.line}:${ancestor.column}`
				: undefined;

			const message = is_tag_valid_with_ancestor(tag, ancestors, child_loc, ancestor_loc);
			if (message) print_error(payload, message);

			ancestor = ancestor.parent;
		}
	}

	parent = child;
}

export function pop_element() {
	parent = /** @type {Element} */ (parent).parent;
}

/**
 * @param {Payload} payload
 */
export function validate_snippet_args(payload) {
	if (
		typeof payload !== 'object' ||
		// for some reason typescript consider the type of payload as never after the first instanceof
		!(payload instanceof Payload || /** @type {any} */ (payload) instanceof HeadPayload)
	) {
		invalid_snippet_arguments();
	}
}

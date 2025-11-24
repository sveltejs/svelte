/** @import { SSRContext } from '#server' */
import { FILENAME } from '../../constants.js';
import {
	is_tag_valid_with_ancestor,
	is_tag_valid_with_parent
} from '../../html-tree-validation.js';
import { set_ssr_context, ssr_context } from './context.js';
import * as e from './errors.js';
import { Renderer } from './renderer.js';

// TODO move this
/**
 * @typedef {{
 * 	tag: string;
 * 	parent: undefined | Element;
 *  filename: undefined | string;
 *  line: number;
 *  column: number;
 * }} Element
 */

/**
 * This is exported so that it can be cleared between tests
 * @type {Set<string>}
 */
export let seen;

/**
 * @param {Renderer} renderer
 * @param {string} message
 */
function print_error(renderer, message) {
	message =
		`node_invalid_placement_ssr: ${message}\n\n` +
		'This can cause content to shift around as the browser repairs the HTML, and will likely result in a `hydration_mismatch` warning.';

	if ((seen ??= new Set()).has(message)) return;
	seen.add(message);

	// eslint-disable-next-line no-console
	console.error(message);
	renderer.head((r) => r.push(`<script>console.error(${JSON.stringify(message)})</script>`));
}

/**
 * @param {Renderer} renderer
 * @param {string} tag
 * @param {number} line
 * @param {number} column
 */
export function push_element(renderer, tag, line, column) {
	var context = /** @type {SSRContext} */ (ssr_context);
	var filename = context.function[FILENAME];
	var parent = context.element;
	var element = { tag, parent, filename, line, column };

	if (parent !== undefined) {
		var ancestor = parent.parent;
		var ancestors = [parent.tag];

		const child_loc = filename ? `${filename}:${line}:${column}` : undefined;
		const parent_loc = parent.filename
			? `${parent.filename}:${parent.line}:${parent.column}`
			: undefined;

		const message = is_tag_valid_with_parent(tag, parent.tag, child_loc, parent_loc);
		if (message) print_error(renderer, message);

		while (ancestor != null) {
			ancestors.push(ancestor.tag);
			const ancestor_loc = ancestor.filename
				? `${ancestor.filename}:${ancestor.line}:${ancestor.column}`
				: undefined;

			const message = is_tag_valid_with_ancestor(tag, ancestors, child_loc, ancestor_loc);
			if (message) print_error(renderer, message);

			ancestor = ancestor.parent;
		}
	}

	set_ssr_context({ ...context, p: context, element });
}

export function pop_element() {
	set_ssr_context(/** @type {SSRContext} */ (ssr_context).p);
}

/**
 * @param {Renderer} renderer
 */
export function validate_snippet_args(renderer) {
	if (
		typeof renderer !== 'object' ||
		// for some reason typescript consider the type of renderer as never after the first instanceof
		!(renderer instanceof Renderer)
	) {
		e.invalid_snippet_arguments();
	}
}

/** @import { SourceLocation } from '#client' */
import { COMMENT_NODE, DOCUMENT_FRAGMENT_NODE, ELEMENT_NODE } from '#client/constants';
import { HYDRATION_END, HYDRATION_START } from '../../../constants.js';
import { hydrating } from '../dom/hydration.js';
import { component_context, dev_stack } from '../context.js';

/**
 * Called right after a template has been created. When rendering on the client, the template only
 * contains its own elements at that point (unlike at the end of the template's body, by which time
 * blocks, child components etc may have inserted elements that don't have locations of their own)
 * @param {DocumentFragment | Element} dom
 * @param {string} filename
 * @param {SourceLocation[]} locations
 */
export function add_locations(dom, filename, locations) {
	if (hydrating) return;
	assign_locations(
		dom.nodeType === DOCUMENT_FRAGMENT_NODE ? dom.firstChild : dom,
		filename,
		locations
	);
}

/**
 * Called once the template's content has been created. During hydration, the elements belonging
 * to child components, snippets and `{@html ...}` tags aren't delimited by hydration markers, but
 * at this point they already have their own locations, so we skip them
 * @param {Node} node
 * @param {string} filename
 * @param {SourceLocation[]} locations
 */
export function add_hydration_locations(node, filename, locations) {
	if (!hydrating) return;
	assign_locations(node, filename, locations);
}

/**
 * @param {Element} element
 * @param {string} filename
 * @param {SourceLocation} location
 */
function assign_location(element, filename, location) {
	// @ts-expect-error
	element.__svelte_meta = {
		parent: dev_stack,
		loc: { file: filename, line: location[0], column: location[1] },
		component: component_context
	};

	if (location[2]) {
		assign_locations(element.firstChild, filename, location[2]);
	}
}

/**
 * @param {Node | null} node
 * @param {string} filename
 * @param {SourceLocation[]} locations
 */
function assign_locations(node, filename, locations) {
	var i = 0;
	var depth = 0;

	while (node && i < locations.length) {
		if (hydrating && node.nodeType === COMMENT_NODE) {
			var comment = /** @type {Comment} */ (node);
			if (comment.data[0] === HYDRATION_START) depth += 1;
			else if (comment.data[0] === HYDRATION_END) depth -= 1;
		}

		// @ts-expect-error
		if (depth === 0 && node.nodeType === ELEMENT_NODE && !node.__svelte_meta) {
			assign_location(/** @type {Element} */ (node), filename, locations[i++]);
		}

		node = node.nextSibling;
	}
}

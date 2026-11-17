/** @import { SourceLocation } from '#client' */
import { COMMENT_NODE, DOCUMENT_FRAGMENT_NODE, ELEMENT_NODE } from '#client/constants';
import { HYDRATION_END, HYDRATION_START } from '../../../constants.js';
import { hydrating } from '../dom/hydration.js';
import { dev_stack } from '../context.js';

/**
 * Called once the template's content has been created. At that point the elements belonging
 * to child components, snippets and `{@html ...}` tags (which during hydration aren't
 * delimited by hydration markers) already have their own locations, so we skip them
 * @param {DocumentFragment | Element} dom
 * @param {string} filename
 * @param {SourceLocation[]} locations
 */
export function add_locations(dom, filename, locations) {
	var node = hydrating ? dom : dom.nodeType === DOCUMENT_FRAGMENT_NODE ? dom.firstChild : dom;
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
		loc: { file: filename, line: location[0], column: location[1] }
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

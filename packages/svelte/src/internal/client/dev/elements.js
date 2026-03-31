/** @import { SourceLocation } from '#client' */
import { COMMENT_NODE, DOCUMENT_FRAGMENT_NODE, ELEMENT_NODE } from '#client/constants';
import { HYDRATION_END, HYDRATION_START } from '../../../constants.js';
import { hydrating } from '../dom/hydration.js';
import { dev_stack } from '../context.js';
import { get_first_child, get_next_sibling, get_node_value, node_type } from '../dom/operations.js';

/**
 * @param {any} fn
 * @param {string} filename
 * @param {SourceLocation[]} locations
 * @returns {any}
 */
export function add_locations(fn, filename, locations) {
	return (/** @type {any[]} */ ...args) => {
		const dom = fn(...args);

		var node = hydrating
			? dom
			: node_type(dom) === DOCUMENT_FRAGMENT_NODE
				? get_first_child(dom)
				: dom;
		assign_locations(node, filename, locations);

		return dom;
	};
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
		assign_locations(get_first_child(element), filename, location[2]);
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
		if (hydrating && node_type(node) === COMMENT_NODE) {
			var comment = /** @type {Comment} */ (node);
			const data = get_node_value(comment) ?? '';
			if (data[0] === HYDRATION_START) depth += 1;
			else if (data[0] === HYDRATION_END) depth -= 1;
		}

		if (depth === 0 && node_type(node) === ELEMENT_NODE) {
			assign_location(/** @type {Element} */ (node), filename, locations[i++]);
		}

		node = get_next_sibling(node);
	}
}

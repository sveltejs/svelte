/** @import { SourceLocation } from '#client' */
import { COMMENT_NODE, DOCUMENT_FRAGMENT_NODE, ELEMENT_NODE } from '#client/constants';
import { HYDRATION_END, HYDRATION_START } from '../../../constants.js';
import { hydrating } from '../dom/hydration.js';
import { component_context, dev_stack } from '../context.js';
import { get_first_child, get_next_sibling, get_node_value, node_type } from '../dom/operations.js';

/**
 * Assign locations immediately after cloning, before blocks or child components insert elements.
 * During hydration, the compiler calls the factory's `hydrate_assign_locations` method after the
 * template's children have their own locations and can be skipped.
 * @param {() => DocumentFragment | Element} fn
 * @param {string} filename
 * @param {SourceLocation[]} locations
 */
export function add_locations(fn, filename, locations) {
	var create = () => {
		var dom = fn();

		if (!hydrating) {
			assign_locations(
				node_type(dom) === DOCUMENT_FRAGMENT_NODE ? get_first_child(dom) : dom,
				filename,
				locations
			);
		}

		return dom;
	};

	create.hydrate_assign_locations = (/** @type {Node} */ node) => {
		// Pass the node explicitly because the same factory can be called repeatedly (e.g. in each blocks).
		if (hydrating) assign_locations(node, filename, locations);
	};

	return create;
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

		// @ts-expect-error
		if (depth === 0 && node_type(node) === ELEMENT_NODE && !node.__svelte_meta) {
			assign_location(/** @type {Element} */ (node), filename, locations[i++]);
		}

		node = get_next_sibling(node);
	}
}

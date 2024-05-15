import { HYDRATION_END, HYDRATION_START } from '../../../constants.js';
import { hydrating } from '../dom/hydration.js';
import { is_array } from '../utils.js';

/**
 * @param {any} fn
 * @param {string} filename
 * @param {import('../../../compiler/phases/3-transform/client/types.js').SourceLocation[]} locations
 * @returns {any}
 */
export function add_locations(fn, filename, locations) {
	return (/** @type {any[]} */ ...args) => {
		const dom = fn(...args);

		const nodes = hydrating
			? is_array(dom)
				? dom
				: [dom]
			: dom.nodeType === 11
				? Array.from(dom.childNodes)
				: [dom];

		assign_locations(nodes, filename, locations);

		return dom;
	};
}

/**
 * @param {Element} element
 * @param {string} filename
 * @param {import('../../../compiler/phases/3-transform/client/types.js').SourceLocation} location
 */
function assign_location(element, filename, location) {
	// @ts-expect-error
	element.__svelte_meta = {
		loc: { filename, line: location[0], column: location[1] }
	};

	if (location[2]) {
		assign_locations(
			/** @type {import('#client').TemplateNode[]} */ (Array.from(element.childNodes)),
			filename,
			location[2]
		);
	}
}

/**
 * @param {import('#client').TemplateNode[]} nodes
 * @param {string} filename
 * @param {import('../../../compiler/phases/3-transform/client/types.js').SourceLocation[]} locations
 */
function assign_locations(nodes, filename, locations) {
	var j = 0;
	var depth = 0;

	for (var i = 0; i < nodes.length; i += 1) {
		var node = nodes[i];

		if (hydrating && node.nodeType === 8) {
			var comment = /** @type {Comment} */ (node);
			if (comment.data === HYDRATION_START) depth += 1;
			if (comment.data.startsWith(HYDRATION_END)) depth -= 1;
		}

		if (depth === 0 && node.nodeType === 1) {
			assign_location(/** @type {Element} */ (node), filename, locations[j++]);
		}
	}
}

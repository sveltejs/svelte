/** @import { TemplateNode } from '#client' */

import { HYDRATION_END, HYDRATION_START, HYDRATION_START_ELSE } from '../../../constants.js';

/**
 * Use this variable to guard everything related to hydration code so it can be treeshaken out
 * if the user doesn't use the `hydrate` method and these code paths are therefore not needed.
 */
export let hydrating = false;

/** @param {boolean} value */
export function set_hydrating(value) {
	hydrating = value;
}

/** @type {TemplateNode} */
export let hydrate_node;

/** @param {TemplateNode} node */
export function set_hydrate_node(node) {
	return (hydrate_node = node);
}

export function hydrate_next() {
	hydrate_node = /** @type {TemplateNode} */ (hydrate_node.nextSibling);
	return hydrate_node;
}

/** @param {TemplateNode} node */
export function reset(node) {
	if (hydrating) {
		hydrate_node = node;
	}
}

export function next() {
	if (hydrating) {
		hydrate_next();
	}
}

export function remove_nodes() {
	var depth = 0;
	var node = hydrate_node;

	while (
		node.nodeType !== 8 ||
		(depth === 0 && /** @type {Comment} */ (node).data !== HYDRATION_END)
	) {
		if (node.nodeType === 8) {
			var data = /** @type {Comment} */ (node).data;
			if (data === HYDRATION_START || data === HYDRATION_START_ELSE) {
				depth += 1;
			} else if (data === HYDRATION_END) {
				depth -= 1;
			}
		}

		var next = /** @type {TemplateNode} */ (node.nextSibling);
		node.remove();
		node = next;
	}

	return node;
}

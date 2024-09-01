/** @import { SvelteNode } from '#compiler' */
import { is_element_node } from '../phases/nodes.js';
import { is_text_attribute } from './ast.js';

/**
 * @param {SvelteNode} node
 */
export function determine_slot(node) {
	if (!is_element_node(node)) return null;

	for (const attribute of node.attributes) {
		if (attribute.type !== 'Attribute') continue;
		if (attribute.name !== 'slot') continue;
		if (!is_text_attribute(attribute)) continue;

		return /** @type {string} */ (attribute.value[0].data);
	}

	return null;
}

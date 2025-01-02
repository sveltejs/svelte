/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {AST.SvelteHTML} node
 * @param {Context} context
 */
export function SvelteHTML(node, context) {
	for (const attribute of node.attributes) {
		if (attribute.type !== 'Attribute') {
			e.svelte_html_illegal_attribute(attribute);
		}
	}

	if (node.fragment.nodes.length > 0) {
		e.svelte_meta_invalid_content(node, node.name);
	}

	context.next();
}

/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {AST.SvelteBoundary} node
 * @param {Context} context
 */
export function SvelteBoundary(node, context) {
	for (const attribute of node.attributes) {
		if (attribute.type === 'SpreadAttribute') {
			e.illegal_element_attribute(attribute, 'svelte:boundary');
		}
	}

	context.next();
}

/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

const valid = ['onerror', 'failed'];

/**
 * @param {AST.SvelteBoundary} node
 * @param {Context} context
 */
export function SvelteBoundary(node, context) {
	for (const attribute of node.attributes) {
		if (attribute.type !== 'Attribute' || !valid.includes(attribute.name)) {
			e.svelte_boundary_invalid_attribute(attribute);
		}
	}

	context.next();
}

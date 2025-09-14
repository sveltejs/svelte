/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

const valid = ['onerror', 'failed', 'pending'];

/**
 * @param {AST.SvelteBoundary} node
 * @param {Context} context
 */
export function SvelteBoundary(node, context) {
	for (const attribute of node.attributes) {
		if (attribute.type !== 'Attribute' || !valid.includes(attribute.name)) {
			e.svelte_boundary_invalid_attribute(attribute);
		}

		if (
			attribute.value === true ||
			(Array.isArray(attribute.value) &&
				(attribute.value.length !== 1 || attribute.value[0].type !== 'ExpressionTag'))
		) {
			e.svelte_boundary_invalid_attribute_value(attribute);
		}
	}

	context.next();
}

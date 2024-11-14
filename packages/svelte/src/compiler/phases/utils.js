/** @import { AST } from '#compiler' */

import { is_boolean_attribute } from '../../utils.js';

/**
 * @param {AST.Attribute} attribute
 */
export function is_inlinable_attribute(attribute) {
	if (attribute.value === true) return false;
	if (is_boolean_attribute(attribute.name.toLowerCase())) return false;

	for (const node of Array.isArray(attribute.value) ? attribute.value : [attribute.value]) {
		if (node.type === 'ExpressionTag' && !node.metadata.expression.can_inline) {
			return false;
		}
	}

	return true;
}

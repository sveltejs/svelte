/** @import { AST } from '#compiler' */

import { is_boolean_attribute } from '../../utils.js';

/**
 * @param {AST.Attribute} attribute
 */
export function is_inlinable_attribute(attribute) {
	if (attribute.value === true) return false;
	if (is_boolean_attribute(attribute.name.toLowerCase())) return false;

	if (Array.isArray(attribute.value)) {
		return is_inlinable_sequence(attribute.value);
	}

	return attribute.value.metadata.expression.can_inline;
}

/**
 * @param {Array<AST.Text | AST.ExpressionTag>} nodes
 */
export function is_inlinable_sequence(nodes) {
	for (let value of nodes) {
		if (value.type === 'ExpressionTag' && !value.metadata.expression.can_inline) {
			return false;
		}
	}

	return true;
}

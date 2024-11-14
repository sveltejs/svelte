/** @import { AST } from '#compiler' */

/**
 * @param {AST.Attribute["value"]} value
 */
export function is_inlinable_expression(value) {
	if (value === true) return false; // not an expression
	let nodes = Array.isArray(value) ? value : [value];
	let has_expression_tag = false;
	for (let value of nodes) {
		if (value.type === 'ExpressionTag') {
			if (!value.metadata.expression.can_inline) {
				return false;
			}

			if (
				// we need to special case null and boolean values because
				// we want to set them programmatically
				value.expression.type === 'Literal' &&
				(value.expression.value === null ||
					typeof value.expression.value === 'boolean' ||
					// we also want to special case the case of a literal with quotes
					// because it could mess with the template
					(typeof value.expression.value === 'string' && value.expression.value.includes('"')))
			) {
				return false;
			}

			has_expression_tag = true;
		}
	}
	return has_expression_tag;
}

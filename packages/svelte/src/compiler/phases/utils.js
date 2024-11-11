/** @import { AST, Binding } from '#compiler' */
/** @import { Scope } from './scope' */

/**
 * Whether a variable can be referenced directly from template string.
 * @param {Binding | undefined} binding
 * @returns {boolean}
 */
function can_inline_variable(binding) {
	return (
		!!binding &&
		// in a `<script module>` block
		!binding.scope.parent &&
		// to prevent the need for escaping
		binding.initial?.type === 'Literal'
	);
}

/**
 * @param {AST.Attribute} attribute
 * @param {Scope} scope
 */
export function is_inlinable_expression(attribute, scope) {
	if (attribute.value === true) return false; // not an expression
	let nodes = Array.isArray(attribute.value) ? attribute.value : [attribute.value];
	let has_expression_tag = false;
	for (let value of nodes) {
		if (value.type === 'ExpressionTag') {
			if (value.expression.type === 'Identifier') {
				const binding = scope.owner(value.expression.name)?.declarations.get(value.expression.name);
				if (!can_inline_variable(binding)) {
					return false;
				}
			} else {
				return false;
			}
			has_expression_tag = true;
		}
	}
	return has_expression_tag;
}

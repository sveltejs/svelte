/** @import { AST, Binding } from '#compiler' */

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
 * @param {(AST.Text | AST.ExpressionTag) | (AST.Text | AST.ExpressionTag)[]} node_or_nodes
 * @param {import('./scope.js').Scope} scope
 */
export function is_inlinable_expression(node_or_nodes, scope) {
	let nodes = Array.isArray(node_or_nodes) ? node_or_nodes : [node_or_nodes];
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

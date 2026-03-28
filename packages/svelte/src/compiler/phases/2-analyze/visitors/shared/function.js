/** @import { ArrowFunctionExpression, FunctionDeclaration, FunctionExpression } from 'estree' */
/** @import { Context } from '../../types' */

/**
 * @param {ArrowFunctionExpression | FunctionExpression | FunctionDeclaration} node
 * @param {Context} context
 */
export function visit_function(node, context) {
	if (context.state.expression) {
		for (const [name] of context.state.scope.references) {
			const binding = context.state.scope.get(name);

			if (binding && binding.scope.function_depth < context.state.scope.function_depth) {
				context.state.expression.references.add(binding);
			}
		}
	}

	const keep_expression_tracking =
		context.state.expression &&
		!context.state.analysis.runes &&
		context.state.derived_function_depth === context.state.function_depth;

	context.next({
		...context.state,
		function_depth: context.state.function_depth + 1,
		expression: keep_expression_tracking ? context.state.expression : null
	});
}

/** @import { ArrowFunctionExpression, FunctionDeclaration, FunctionExpression } from 'estree' */
/** @import { Context } from '../../types' */

/**
 * @param {ArrowFunctionExpression | FunctionExpression | FunctionDeclaration} node
 * @param {Context} context
 */
export function visit_function(node, context) {
	// TODO retire this in favour of a more general solution based on bindings
	node.metadata = {
		hoisted: false,
		hoisted_params: [],
		scope: context.state.scope
	};

	if (context.state.expression) {
		for (const [name] of context.state.scope.references) {
			const binding = context.state.scope.get(name);

			if (binding && binding.scope.function_depth < context.state.scope.function_depth) {
				context.state.expression.references.add(binding);
			}
		}
	}

	context.next({
		...context.state,
		function_depth: context.state.function_depth + 1,
		expression: null
	});
}

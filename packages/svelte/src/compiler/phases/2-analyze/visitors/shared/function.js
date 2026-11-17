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

			if (binding && binding.scope !== context.state.scope) {
				context.state.expression.references.add(binding);
			}
		}
	}

	context.next({
		...context.state,
		// we generally want to use scope.function_depth unless we specifically increased
		// that in state.function_depth (e.g. a derived)
		function_depth: Math.max(context.state.scope.function_depth, context.state.function_depth) + 1,
		// a real closure boundary makes any outer-scope reference inside it a legitimate
		// deferred read, not a snapshot capture, so the `outer_function_depth` special-case
		// from `DeclarationTag` no longer applies once we're inside one
		outer_function_depth: undefined,
		expression: null
	});
}

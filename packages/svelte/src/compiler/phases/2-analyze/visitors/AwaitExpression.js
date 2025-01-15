/** @import { AwaitExpression } from 'estree' */
/** @import { Context } from '../types' */

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	if (!context.state.analysis.runes) {
		throw new Error('TODO runes mode only');
	}

	if (context.state.expression) {
		context.state.expression.is_async = true;
	}

	if (context.state.ast_type === 'instance' && context.state.scope.function_depth === 1) {
		context.state.analysis.is_async = true;
	}

	context.next();
}

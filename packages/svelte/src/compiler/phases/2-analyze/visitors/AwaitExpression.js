/** @import { AwaitExpression } from 'estree' */
/** @import { Context } from '../types' */

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	const tla = context.state.ast_type === 'instance' && context.state.function_depth === 1;
	const blocking = tla || !!context.state.expression;

	if (blocking) {
		if (!context.state.analysis.runes) {
			throw new Error('TODO runes mode only');
		}

		context.state.analysis.suspenders.add(node);
	}

	if (context.state.expression) {
		context.state.expression.is_async = true;
	}

	if (tla) {
		context.state.analysis.is_async = true;
	}

	context.next();
}

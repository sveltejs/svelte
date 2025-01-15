/** @import { AwaitExpression } from 'estree' */
/** @import { Context } from '../types' */

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	if (context.state.expression) {
		context.state.expression.is_async = true;
	}

	context.next();
}

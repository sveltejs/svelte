/** @import { NewExpression, Expression } from 'estree' */
/** @import { Context } from '../types' */
import { dev } from '../../../../state.js';
import { trace } from '../utils.js';

/**
 * @param {NewExpression} node
 * @param {Context} context
 */
export function NewExpression(node, context) {
	if (dev) {
		return trace(
			node,
			{
				...node,
				callee: /** @type {Expression} */ (context.visit(node.callee)),
				arguments: node.arguments.map((arg) => /** @type {Expression} */ (context.visit(arg)))
			},
			context.state
		);
	}

	context.next();
}

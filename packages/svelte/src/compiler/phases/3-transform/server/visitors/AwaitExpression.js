/** @import { AwaitExpression, Expression } from 'estree' */
/** @import { Context } from '../types' */
import { save } from '../../../../utils/ast.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	const argument = /** @type {Expression} */ (context.visit(node.argument));

	if (context.state.analysis.pickled_awaits.has(node)) {
		return save(argument);
	}

	// we also need to restore context after block expressions
	let i = context.path.length;
	while (i--) {
		const parent = context.path[i];

		if (
			parent.type === 'ArrowFunctionExpression' ||
			parent.type === 'FunctionExpression' ||
			parent.type === 'FunctionDeclaration'
		) {
			break;
		}

		// @ts-ignore
		if (parent.metadata) {
			if (parent.type !== 'ExpressionTag' && parent.type !== 'Fragment') {
				return save(argument);
			}

			break;
		}
	}

	return argument === node.argument ? node : { ...node, argument };
}

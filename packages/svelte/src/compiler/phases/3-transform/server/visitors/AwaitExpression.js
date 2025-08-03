/** @import { AwaitExpression } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	// if `await` is inside a function, or inside `<script module>`,
	// allow it, otherwise error
	if (
		context.state.scope.function_depth === 0 ||
		context.path.some(
			(node) =>
				node.type === 'ArrowFunctionExpression' ||
				node.type === 'FunctionDeclaration' ||
				node.type === 'FunctionExpression'
		)
	) {
		return context.next();
	}

	return b.call('$.await_outside_boundary');
}

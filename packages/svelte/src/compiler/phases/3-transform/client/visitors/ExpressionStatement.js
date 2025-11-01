/** @import { ExpressionStatement } from 'estree' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import { get_rune } from '../../../scope.js';

/**
 * @param {ExpressionStatement} node
 * @param {ComponentContext} context
 */
export function ExpressionStatement(node, context) {
	if (node.expression.type === 'CallExpression') {
		const rune = get_rune(node.expression, context.state.scope);

		if (rune === '$inspect.trace') {
			return b.empty;
		}
	}

	context.next();
}

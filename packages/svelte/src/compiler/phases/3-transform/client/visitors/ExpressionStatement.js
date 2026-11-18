/** @import { ExpressionStatement } from 'estree' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import { get_rune } from '../../../scope.js';
import { dev } from '../../../../state.js';
import { remove_comments } from '../../utils.js';

/**
 * @param {ExpressionStatement} node
 * @param {ComponentContext} context
 */
export function ExpressionStatement(node, context) {
	if (node.expression.type === 'CallExpression') {
		const rune = get_rune(node.expression, context.state.scope);

		if (rune === '$inspect.trace') {
			if (!dev) remove_comments(node, context.state);
			return b.empty;
		}
	}

	context.next();
}

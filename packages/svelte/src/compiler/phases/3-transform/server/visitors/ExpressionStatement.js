/** @import { ExpressionStatement } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '#compiler/builders';
import { get_rune } from '../../../scope.js';

/**
 * @param {ExpressionStatement} node
 * @param {Context} context
 */
export function ExpressionStatement(node, context) {
	const rune = get_rune(node.expression, context.state.scope);

	if (
		rune === '$effect' ||
		rune === '$effect.pre' ||
		rune === '$effect.root' ||
		rune === '$inspect.trace'
	) {
		return b.empty;
	}

	context.next();
}

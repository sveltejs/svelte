/** @import { ExpressionStatement } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {ExpressionStatement} node
 * @param {Context} context
 */
export function ExpressionStatementRunes(node, context) {
	const expression = node.expression;

	if (expression.type === 'CallExpression') {
		const callee = expression.callee;

		if (callee.type === 'Identifier' && callee.name === '$effect') {
			return b.empty;
		}

		if (
			callee.type === 'MemberExpression' &&
			callee.object.type === 'Identifier' &&
			callee.object.name === '$effect'
		) {
			return b.empty;
		}
	}

	context.next();
}

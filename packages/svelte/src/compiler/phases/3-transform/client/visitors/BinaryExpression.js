/** @import { Expression, BinaryExpression } from 'estree' */
/** @import { ComponentContext } from '../types' */
import { dev } from '../../../../state.js';
import * as b from '#compiler/builders';

/**
 * @param {BinaryExpression} node
 * @param {ComponentContext} context
 */
export function BinaryExpression(node, context) {
	if (dev) {
		const operator = node.operator;

		if (operator === '===' || operator === '!==') {
			return b.call(
				'$.strict_equals',
				/** @type {Expression} */ (context.visit(node.left)),
				/** @type {Expression} */ (context.visit(node.right)),
				operator === '!==' && b.false
			);
		}

		if (operator === '==' || operator === '!=') {
			return b.call(
				'$.equals',
				/** @type {Expression} */ (context.visit(node.left)),
				/** @type {Expression} */ (context.visit(node.right)),
				operator === '!=' && b.false
			);
		}
	}

	context.next();
}

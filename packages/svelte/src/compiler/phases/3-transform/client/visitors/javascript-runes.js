/** @import { Expression } from 'estree' */
/** @import { ComponentVisitors } from '../types.js' */
import { dev } from '../../../../state.js';
import * as b from '../../../../utils/builders.js';

/** @type {ComponentVisitors} */
export const javascript_visitors_runes = {
	ExpressionStatement(node, context) {
		if (node.expression.type === 'CallExpression') {
			const callee = node.expression.callee;

			if (
				callee.type === 'Identifier' &&
				callee.name === '$effect' &&
				!context.state.scope.get('$effect')
			) {
				const func = context.visit(node.expression.arguments[0]);
				return {
					...node,
					expression: b.call('$.user_effect', /** @type {Expression} */ (func))
				};
			}

			if (
				callee.type === 'MemberExpression' &&
				callee.object.type === 'Identifier' &&
				callee.object.name === '$effect' &&
				callee.property.type === 'Identifier' &&
				callee.property.name === 'pre' &&
				!context.state.scope.get('$effect')
			) {
				const func = context.visit(node.expression.arguments[0]);
				return {
					...node,
					expression: b.call('$.user_pre_effect', /** @type {Expression} */ (func))
				};
			}
		}

		context.next();
	},
	BinaryExpression(node, { state, visit, next }) {
		const operator = node.operator;

		if (dev) {
			if (operator === '===' || operator === '!==') {
				return b.call(
					'$.strict_equals',
					/** @type {Expression} */ (visit(node.left)),
					/** @type {Expression} */ (visit(node.right)),
					operator === '!==' && b.literal(false)
				);
			}

			if (operator === '==' || operator === '!=') {
				return b.call(
					'$.equals',
					/** @type {Expression} */ (visit(node.left)),
					/** @type {Expression} */ (visit(node.right)),
					operator === '!=' && b.literal(false)
				);
			}
		}

		next();
	}
};

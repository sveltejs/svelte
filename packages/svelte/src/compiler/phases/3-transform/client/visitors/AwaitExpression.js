/** @import { AST } from '#compiler' */
/** @import { AwaitExpression, Expression, Property, SpreadElement } from 'estree' */
/** @import { Context } from '../types' */
import { dev } from '../../../../state.js';
import * as b from '../../../../utils/builders.js';
import { get_rune } from '../../../scope.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	const save =
		// preserve context if this is a top-level await in `<script>`
		(context.state.is_instance && context.state.scope.function_depth === 1) ||
		// or if this is a derived/template expression
		(is_reactive_expression(context) && !is_last_evaluated_expression(context.path, node));

	if (dev || save) {
		const expression = /** @type {Expression} */ (context.visit(node.argument));
		return b.call(b.await(b.call('$.save', expression, !save && b.false)));
	}

	return context.next();
}

/**
 * @param {Context} context
 */
function is_reactive_expression(context) {
	let i = context.path.length;

	while (i--) {
		const parent = context.path[i];

		if (
			parent.type === 'ArrowFunctionExpression' ||
			parent.type === 'FunctionExpression' ||
			parent.type === 'FunctionDeclaration'
		) {
			return false;
		}

		if (parent.type === 'CallExpression' && get_rune(parent, context.state.scope) === '$derived') {
			return true;
		}

		// @ts-expect-error we could probably use a neater/more robust mechanism
		if (parent.metadata) {
			return true;
		}
	}

	return false;
}

/**
 * @param {AST.SvelteNode[]} path
 * @param {Expression | SpreadElement | Property} node
 */
function is_last_evaluated_expression(path, node) {
	let i = path.length;

	while (i--) {
		const parent = /** @type {Expression | Property | SpreadElement} */ (path[i]);

		// @ts-expect-error we could probably use a neater/more robust mechanism
		if (parent.metadata) {
			return true;
		}

		switch (parent.type) {
			case 'ArrayExpression':
				if (node !== parent.elements.at(-1)) return false;
				break;

			case 'AssignmentExpression':
			case 'BinaryExpression':
			case 'LogicalExpression':
				if (node === parent.left) return false;
				break;

			case 'CallExpression':
			case 'NewExpression':
				if (node !== parent.arguments.at(-1)) return false;
				break;

			case 'ConditionalExpression':
				if (node === parent.test) return false;
				break;

			case 'MemberExpression':
				if (parent.computed && node === parent.object) return false;
				break;

			case 'ObjectExpression':
				if (node !== parent.properties.at(-1)) return false;
				break;

			case 'Property':
				if (node === parent.key) return false;
				break;

			case 'SequenceExpression':
				if (node !== parent.expressions.at(-1)) return false;
				break;

			case 'TaggedTemplateExpression':
				if (node !== parent.quasi.expressions.at(-1)) return false;
				break;

			case 'TemplateLiteral':
				if (node !== parent.expressions.at(-1)) return false;
				break;

			default:
				return false;
		}

		node = parent;
	}
}

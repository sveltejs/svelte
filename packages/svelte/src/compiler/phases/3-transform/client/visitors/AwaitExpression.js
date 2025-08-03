/** @import { AwaitExpression, Expression, Property, SpreadElement } from 'estree' */
/** @import { Context } from '../types' */
import { dev, is_ignored } from '../../../../state.js';
import * as b from '../../../../utils/builders.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	const argument = /** @type {Expression} */ (context.visit(node.argument));

	const tla = context.state.is_instance && context.state.scope.function_depth === 1;

	// preserve context for
	//   a) top-level await and
	//   b) awaits that precede other expressions in template or `$derived(...)`
	if (tla || (is_reactive_expression(context) && !is_last_evaluated_expression(context, node))) {
		return b.call(b.await(b.call('$.save', argument)));
	}

	// in dev, note which values are read inside a reactive expression,
	// but don't track them
	else if (dev && !is_ignored(node, 'await_reactivity_loss')) {
		return b.call(b.await(b.call('$.track_reactivity_loss', argument)));
	}

	return argument === node.argument ? node : { ...node, argument };
}

/**
 * @param {Context} context
 */
function is_reactive_expression(context) {
	if (context.state.in_derived) {
		return true;
	}

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

		// @ts-expect-error we could probably use a neater/more robust mechanism
		if (parent.metadata) {
			return true;
		}
	}

	return false;
}

/**
 * @param {Context} context
 * @param {Expression | SpreadElement | Property} node
 */
function is_last_evaluated_expression(context, node) {
	let i = context.path.length;

	while (i--) {
		const parent = /** @type {Expression | Property | SpreadElement} */ (context.path[i]);

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

/** @import { AwaitExpression, Expression, SpreadElement, Property } from 'estree' */
/** @import { Context } from '../types' */
/** @import { AST } from '#compiler' */
import * as e from '../../../errors.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	const tla = context.state.ast_type === 'instance' && context.state.function_depth === 1;

	// preserve context for awaits that precede other expressions in template or `$derived(...)`
	if (
		is_reactive_expression(
			context.path,
			context.state.derived_function_depth === context.state.function_depth
		) &&
		!is_last_evaluated_expression(context.path, node)
	) {
		context.state.analysis.pickled_awaits.add(node);
	}

	let suspend = tla;

	if (context.state.expression) {
		context.state.expression.has_await = true;

		suspend = true;
	}

	// disallow top-level `await` or `await` in template expressions
	// unless a) in runes mode and b) opted into `experimental.async`
	if (suspend) {
		if (!context.state.options.experimental.async) {
			e.experimental_async(node);
		}

		if (!context.state.analysis.runes) {
			e.legacy_await_invalid(node);
		}
	}

	context.next();
}

/**
 * @param {AST.SvelteNode[]} path
 * @param {boolean} in_derived
 */
export function is_reactive_expression(path, in_derived) {
	if (in_derived) return true;

	let i = path.length;

	while (i--) {
		const parent = path[i];

		if (
			parent.type === 'ArrowFunctionExpression' ||
			parent.type === 'FunctionExpression' ||
			parent.type === 'FunctionDeclaration'
		) {
			// No reactive expression found between function and await
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
 * @param {AST.SvelteNode[]} path
 * @param {Expression | SpreadElement | Property} node
 */
function is_last_evaluated_expression(path, node) {
	let i = path.length;

	while (i--) {
		const parent = path[i];

		if (parent.type === 'ConstTag') {
			// {@const ...} tags are treated as deriveds and its contents should all get the preserve-reactivity treatment
			return false;
		}

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

			case 'VariableDeclarator':
				return true;

			default:
				return false;
		}

		node = parent;
	}
}

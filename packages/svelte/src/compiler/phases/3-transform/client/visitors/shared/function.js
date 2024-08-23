/** @import { ArrowFunctionExpression, BlockStatement, FunctionExpression, Node, Pattern } from 'estree' */
/** @import { ComponentContext } from '../../types' */
import { build_hoisted_params } from '../../utils.js';
import * as b from '../../../../../utils/builders.js';

/**
 * @param {ArrowFunctionExpression | FunctionExpression} node
 * @param {ComponentContext} context
 */
export const visit_function = (node, context) => {
	const metadata = node.metadata;

	let state = { ...context.state, in_constructor: false };
	let in_constructor = false;

	if (node.type === 'FunctionExpression') {
		const parent = /** @type {Node} */ (context.path.at(-1));
		in_constructor = state.in_constructor =
			parent.type === 'MethodDefinition' && parent.kind === 'constructor';
	}

	if (metadata?.hoisted === true) {
		const params = build_hoisted_params(node, context);

		return /** @type {FunctionExpression} */ ({
			...node,
			params,
			body: context.visit(node.body, state)
		});
	}

	if (in_constructor && (state.private_state.size > 0 || state.public_state.size > 0)) {
		const params = /** @type {Pattern[]} */ (node.params.map((p) => context.visit(p, state)));
		const body = /** @type {BlockStatement} */ (context.visit(node.body, state));
		const has_super_call =
			body.body[0]?.type === 'ExpressionStatement' &&
			body.body[0].expression.type === 'CallExpression' &&
			body.body[0].expression.callee.type === 'Super';
		const enter = b.var('$$', b.call('$.enter_constructor'));
		const leave = b.stmt(b.call('$.leave_constructor', b.id('$$')));

		body.body.splice(has_super_call ? 1 : 0, 0, enter);
		body.body.push(leave);

		return {
			...node,
			params,
			body
		};
	} else {
		context.next(state);
	}
};

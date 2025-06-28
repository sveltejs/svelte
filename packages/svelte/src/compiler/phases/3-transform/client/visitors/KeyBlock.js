/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import { build_expression, with_dev_stack } from './shared/utils.js';

/**
 * @param {AST.KeyBlock} node
 * @param {ComponentContext} context
 */
export function KeyBlock(node, context) {
	context.state.template.push_comment();

	const key = build_expression(context, node.expression, node.metadata.expression);
	const body = /** @type {Expression} */ (context.visit(node.fragment));

	context.state.init.push(
		with_dev_stack(
			b.call('$.key', context.state.node, b.thunk(key), b.arrow([b.id('$$anchor')], body)),
			node,
			'key'
		)
	);
}

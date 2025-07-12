/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import { build_expression, add_svelte_meta } from './shared/utils.js';

/**
 * @param {AST.KeyBlock} node
 * @param {ComponentContext} context
 */
export function KeyBlock(node, context) {
	context.state.template.push_comment();

	const { has_await } = node.metadata.expression;

	const expression = build_expression(context, node.expression, node.metadata.expression);
	const key = b.thunk(has_await ? b.call('$.get', b.id('$$key')) : expression);
	const body = /** @type {Expression} */ (context.visit(node.fragment));

	let statement = add_svelte_meta(
		b.call('$.key', context.state.node, key, b.arrow([b.id('$$anchor')], body)),
		node,
		'key'
	);

	if (has_await) {
		statement = b.stmt(
			b.call(
				'$.async',
				context.state.node,
				b.array([b.thunk(expression, true)]),
				b.arrow([context.state.node, b.id('$$key')], b.block([statement]))
			)
		);
	}

	context.state.init.push(statement);
}

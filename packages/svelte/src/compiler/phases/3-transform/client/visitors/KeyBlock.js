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

	const is_async = node.metadata.expression.is_async();

	const expression = build_expression(context, node.expression, node.metadata.expression);
	const key = b.thunk(is_async ? b.call('$.get', b.id('$$key')) : expression);
	const body = /** @type {Expression} */ (context.visit(node.fragment));

	let statement = add_svelte_meta(
		b.call('$.key', context.state.node, key, b.arrow([b.id('$$anchor')], body)),
		node,
		'key'
	);

	if (is_async) {
		statement = b.stmt(
			b.call(
				'$.async',
				context.state.node,
				node.metadata.expression.blockers(),
				b.array([b.thunk(expression, node.metadata.expression.has_await)]),
				b.arrow([context.state.node, b.id('$$key')], b.block([statement]))
			)
		);
	}

	context.state.init.push(statement);
}

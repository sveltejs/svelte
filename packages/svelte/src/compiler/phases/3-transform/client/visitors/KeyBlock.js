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

	const has_await = node.metadata.expression.has_await;
	const has_blockers = node.metadata.expression.has_blockers();

	const expression = build_expression(context, node.expression, node.metadata.expression);
	const key = b.thunk(has_await ? b.call('$.get', b.id('$$key')) : expression);
	const body = /** @type {Expression} */ (context.visit(node.fragment));

	const statement = add_svelte_meta(
		b.call('$.key', context.state.node, key, b.arrow([b.id('$$anchor')], body)),
		node,
		'key'
	);

	if (has_await || has_blockers) {
		context.state.init.push(
			b.stmt(
				b.call(
					'$.async',
					context.state.node,
					node.metadata.expression.blockers(),
					has_await ? b.array([b.thunk(expression, true)]) : b.void0,
					b.arrow(
						has_await ? [context.state.node, b.id('$$key')] : [context.state.node],
						b.block([statement])
					)
				)
			)
		);
	} else {
		context.state.init.push(statement);
	}
}

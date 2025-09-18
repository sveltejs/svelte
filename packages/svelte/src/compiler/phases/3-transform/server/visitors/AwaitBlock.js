/** @import { BlockStatement, Expression, Pattern, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { block_close, call_child_renderer } from './shared/utils.js';

/**
 * @param {AST.AwaitBlock} node
 * @param {ComponentContext} context
 */
export function AwaitBlock(node, context) {
	/** @type {Statement} */
	let statement = b.stmt(
		b.call(
			'$.await',
			b.id('$$renderer'),
			/** @type {Expression} */ (context.visit(node.expression)),
			b.thunk(
				node.pending ? /** @type {BlockStatement} */ (context.visit(node.pending)) : b.block([])
			),
			b.arrow(
				node.value ? [/** @type {Pattern} */ (context.visit(node.value))] : [],
				node.then ? /** @type {BlockStatement} */ (context.visit(node.then)) : b.block([])
			)
		)
	);

	if (node.metadata.expression.has_await) {
		statement = call_child_renderer(b.block([statement]), true);
	}

	context.state.template.push(statement, block_close);
}

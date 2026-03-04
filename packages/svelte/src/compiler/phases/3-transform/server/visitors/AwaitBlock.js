/** @import { BlockStatement, Expression, Pattern, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { block_close, create_child_block } from './shared/utils.js';

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

	context.state.template.push(
		...create_child_block(
			[statement],
			node.metadata.expression.blockers(),
			node.metadata.expression.has_await
		),
		block_close
	);
}

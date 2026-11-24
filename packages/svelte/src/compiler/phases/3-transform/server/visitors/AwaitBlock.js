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
	let expression = /** @type {Expression} */ (context.visit(node.expression));
	if (node.metadata.expression.has_await) {
		// If this is an await expression, turn it into a IIFE so that the result is a promise.
		// {#await await ...} is special insofar that the await should not be waited on.
		expression = b.call(b.arrow([], expression, true));
	}

	/** @type {Statement} */
	let statement = b.stmt(
		b.call(
			'$.await',
			b.id('$$renderer'),
			expression,
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

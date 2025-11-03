/** @import { BlockStatement, Expression, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { block_close, block_open, block_open_else, create_async_block } from './shared/utils.js';

/**
 * @param {AST.IfBlock} node
 * @param {ComponentContext} context
 */
export function IfBlock(node, context) {
	const test = /** @type {Expression} */ (context.visit(node.test));
	const consequent = /** @type {BlockStatement} */ (context.visit(node.consequent));

	const alternate = node.alternate
		? /** @type {BlockStatement} */ (context.visit(node.alternate))
		: b.block([]);

	consequent.body.unshift(b.stmt(b.call(b.id('$$renderer.push'), block_open)));

	alternate.body.unshift(b.stmt(b.call(b.id('$$renderer.push'), block_open_else)));

	/** @type {Statement} */
	let statement = b.if(test, consequent, alternate);

	const is_async = node.metadata.expression.is_async();

	const has_await =
		node.metadata.expression.has_await ||
		// TODO get rid of this stuff
		node.consequent.metadata.has_await ||
		node.alternate?.metadata.has_await;

	if (is_async || has_await) {
		statement = create_async_block(
			b.block([statement]),
			node.metadata.expression.blockers(),
			!!has_await
		);
	}

	context.state.template.push(statement, block_close);
}

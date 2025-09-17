/** @import { BlockStatement, Expression, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { block_close, block_open, block_open_else, call_child_renderer } from './shared/utils.js';

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

	consequent.body.unshift(b.stmt(b.call(b.id(' $$renderer.push'), block_open)));

	alternate.body.unshift(b.stmt(b.call(b.id(' $$renderer.push'), block_open_else)));

	/** @type {Statement} */
	let statement = b.if(test, consequent, alternate);

	if (node.metadata.expression.has_await) {
		statement = call_child_renderer(b.block([statement]), true);
	}

	context.state.template.push(statement, block_close);
}

/** @import { BlockStatement, Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { BLOCK_OPEN_ELSE } from '../../../../../internal/server/hydration.js';
import * as b from '#compiler/builders';
import { block_close, block_open } from './shared/utils.js';

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

	consequent.body.unshift(
		b.stmt(b.call(b.member(b.id('$$payload.out'), b.id('push')), block_open))
	);

	alternate.body.unshift(
		b.stmt(b.call(b.member(b.id('$$payload.out'), b.id('push')), b.literal(BLOCK_OPEN_ELSE)))
	);

	context.state.template.push(b.if(test, consequent, alternate), block_close);
}

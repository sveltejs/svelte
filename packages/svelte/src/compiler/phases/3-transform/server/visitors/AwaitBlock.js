/** @import { BlockStatement, Expression, Pattern } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { block_close } from './shared/utils.js';

/**
 * @param {AST.AwaitBlock} node
 * @param {ComponentContext} context
 */
export function AwaitBlock(node, context) {
	context.state.template.push(
		b.stmt(
			b.call(
				'$.await',
				b.id('$$payload'),
				/** @type {Expression} */ (context.visit(node.expression)),
				b.thunk(
					node.pending ? /** @type {BlockStatement} */ (context.visit(node.pending)) : b.block([])
				),
				b.arrow(
					node.value ? [/** @type {Pattern} */ (context.visit(node.value))] : [],
					node.then ? /** @type {BlockStatement} */ (context.visit(node.then)) : b.block([])
				)
			)
		),
		block_close
	);
}

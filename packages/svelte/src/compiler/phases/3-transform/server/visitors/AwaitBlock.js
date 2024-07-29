/** @import { BlockStatement, Expression, Pattern } from 'estree' */
/** @import { AwaitBlock } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '../../../../utils/builders.js';
import { empty_comment } from './shared/utils.js';

/**
 * @param {AwaitBlock} node
 * @param {ComponentContext} context
 */
export function AwaitBlock(node, context) {
	context.state.template.push(
		empty_comment,
		b.stmt(
			b.call(
				'$.await',
				/** @type {Expression} */ (context.visit(node.expression)),
				b.thunk(
					node.pending ? /** @type {BlockStatement} */ (context.visit(node.pending)) : b.block([])
				),
				b.arrow(
					node.value ? [/** @type {Pattern} */ (context.visit(node.value))] : [],
					node.then ? /** @type {BlockStatement} */ (context.visit(node.then)) : b.block([])
				),
				b.arrow(
					node.error ? [/** @type {Pattern} */ (context.visit(node.error))] : [],
					node.catch ? /** @type {BlockStatement} */ (context.visit(node.catch)) : b.block([])
				)
			)
		),
		empty_comment
	);
}

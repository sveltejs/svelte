/** @import { BlockStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { block_close, block_open, empty_comment } from './shared/utils.js';

/**
 * @param {AST.KeyBlock} node
 * @param {ComponentContext} context
 */
export function KeyBlock(node, context) {
	const is_async = node.metadata.expression.is_async();

	if (is_async) context.state.template.push(block_open);

	context.state.template.push(
		empty_comment,
		/** @type {BlockStatement} */ (context.visit(node.fragment)),
		empty_comment
	);

	if (is_async) context.state.template.push(block_close);
}

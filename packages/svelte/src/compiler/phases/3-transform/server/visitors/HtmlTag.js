/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { block_close, block_open, create_push } from './shared/utils.js';

/**
 * @param {AST.HtmlTag} node
 * @param {ComponentContext} context
 */
export function HtmlTag(node, context) {
	const expression = /** @type {Expression} */ (context.visit(node.expression));
	const call = b.call('$.html', expression);

	const has_await = node.metadata.expression.has_await;

	if (has_await) {
		context.state.template.push(block_open);
	}

	context.state.template.push(create_push(call, node.metadata.expression, true));

	if (has_await) {
		context.state.template.push(block_close);
	}
}

/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';

/**
 * @param {AST.HtmlTag} node
 * @param {ComponentContext} context
 */
export function HtmlTag(node, context) {
	const expression = /** @type {Expression} */ (context.visit(node.expression));
	const call = b.call('$.html', expression);
	context.state.template.push(
		node.metadata.expression.has_await
			? b.stmt(b.call('$$renderer.push', b.thunk(call, true)))
			: call
	);
}

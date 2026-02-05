/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { create_child_block } from './shared/utils.js';

/**
 * @param {AST.HtmlTag} node
 * @param {ComponentContext} context
 */
export function HtmlTag(node, context) {
	const expression = b.call('$.html', /** @type {Expression} */ (context.visit(node.expression)));

	if (node.metadata.expression.is_async()) {
		context.state.template.push(
			...create_child_block(
				[b.stmt(b.call('$$renderer.push', expression))],
				node.metadata.expression.blockers(),
				node.metadata.expression.has_await
			)
		);
	} else {
		context.state.template.push(expression);
	}
}

/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { create_push } from './shared/utils.js';

/**
 * @param {AST.HtmlTag} node
 * @param {ComponentContext} context
 */
export function HtmlTag(node, context) {
	const expression = /** @type {Expression} */ (context.visit(node.expression));
	const call = b.call('$.html', expression);

	context.state.template.push(create_push(call, node.metadata.expression, true));
}

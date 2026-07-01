/** @import { BlockStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import { build_expression } from './shared/utils.js';

/**
 * @param {AST.PortalBlock} node
 * @param {ComponentContext} context
 */
export function PortalBlock(node, context) {
	context.state.template.push_comment();

	const value = build_expression(context, node.expression, node.metadata.expression);
	const body = /** @type {BlockStatement} */ (
		context.visit(node.fragment, { ...context.state, transform: { ...context.state.transform } })
	);
	const portal = b.call('$.portal', b.thunk(value), b.arrow([b.id('$$anchor')], body));

	context.state.init.push(b.stmt(portal));
}

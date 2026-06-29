/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import { build_expression } from './shared/utils.js';

/**
 * @param {AST.PortalTag} node
 * @param {ComponentContext} context
 */
export function PortalTag(node, context) {
	context.state.template.push_comment();

	const value = build_expression(context, node.expression, node.metadata.expression);
	context.state.init.push(b.stmt(b.call('$.portal_outlet', context.state.node, b.thunk(value))));
}

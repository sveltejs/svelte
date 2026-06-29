/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {AST.PortalBlock} node
 * @param {Context} context
 */
export function PortalBlock(node, context) {
	mark_subtree_dynamic(context.path);

	context.visit(node.expression, {
		...context.state,
		expression: node.metadata.expression
	});

	context.visit(node.fragment);
}

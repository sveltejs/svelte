/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { validate_opening_tag } from './shared/utils.js';
import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {AST.PortalTag} node
 * @param {Context} context
 */
export function PortalTag(node, context) {
	validate_opening_tag(node, context.state, '@');
	node.metadata.path = [...context.path];
	mark_subtree_dynamic(context.path);

	context.visit(node.expression, {
		...context.state,
		expression: node.metadata.expression
	});
}

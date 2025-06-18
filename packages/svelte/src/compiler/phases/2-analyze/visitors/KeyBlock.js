/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { mark_subtree_dynamic } from './shared/fragment.js';
import { validate_block_not_empty, validate_opening_tag } from './shared/utils.js';

/**
 * @param {AST.KeyBlock} node
 * @param {Context} context
 */
export function KeyBlock(node, context) {
	validate_block_not_empty(node.fragment, context);

	if (context.state.analysis.runes) {
		validate_opening_tag(node, context.state, '#');
	}

	mark_subtree_dynamic(context.path);

	context.visit(node.expression, { ...context.state, expression: node.metadata.expression });
	context.visit(node.fragment);
}

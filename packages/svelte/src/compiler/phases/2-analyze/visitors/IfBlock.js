/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { mark_subtree_dynamic } from './shared/fragment.js';
import { validate_block_not_empty, validate_opening_tag } from './shared/utils.js';

/**
 * @param {AST.IfBlock} node
 * @param {Context} context
 */
export function IfBlock(node, context) {
	validate_block_not_empty(node.consequent, context);
	validate_block_not_empty(node.alternate, context);

	if (context.state.analysis.runes) {
		validate_opening_tag(node, context.state, node.elseif ? ':' : '#');
	}

	mark_subtree_dynamic(context.path);

	context.visit(node.test, {
		...context.state,
		expression: node.metadata.expression
	});

	context.visit(node.consequent);
	if (node.alternate) context.visit(node.alternate);
}

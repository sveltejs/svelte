/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { props_id_needs_hydration } from '../utils/props_id_needs_hydration.js';
import { mark_subtree_dynamic } from './shared/fragment.js';
import { validate_block_not_empty, validate_opening_tag } from './shared/utils.js';

/**
 * @param {AST.KeyBlock} node
 * @param {Context} context
 */
export function KeyBlock(node, context) {
	if (props_id_needs_hydration(node, context.path)) {
		context.state.props_id_needs_hydration.value = false;
	}
	validate_block_not_empty(node.fragment, context);

	if (context.state.analysis.runes) {
		validate_opening_tag(node, context.state, '#');
	}

	mark_subtree_dynamic(context.path);

	context.next();
}

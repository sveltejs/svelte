/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { is_tag_valid_with_parent } from '../../../../html-tree-validation.js';
import * as e from '../../../errors.js';
import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {AST.ExpressionTag} node
 * @param {Context} context
 */
export function ExpressionTag(node, context) {
	if (node.parent && context.state.parent_element) {
		if (!is_tag_valid_with_parent('#text', context.state.parent_element)) {
			e.node_invalid_placement(node, '`{expression}`', context.state.parent_element);
		}
	}

	// TODO ideally we wouldn't do this here, we'd just do it on encountering
	// an `Identifier` within the tag. But we currently need to handle `{42}` etc
	mark_subtree_dynamic(context.path);

	context.next({ ...context.state, expression: node.metadata.expression });
}

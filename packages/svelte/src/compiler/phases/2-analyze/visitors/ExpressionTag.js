/** @import { ExpressionTag } from '#compiler' */
/** @import { Context } from '../types' */
import { is_tag_valid_with_parent } from '../../../../html-tree-validation.js';
import * as e from '../../../errors.js';

/**
 * @param {ExpressionTag} node
 * @param {Context} context
 */
export function ExpressionTag(node, context) {
	if (!node.parent) {
		return;
	}

	if (context.state.parent_element) {
		if (!is_tag_valid_with_parent('#text', context.state.parent_element)) {
			e.node_invalid_placement(node, '`{expression}`', context.state.parent_element);
		}
	}
}

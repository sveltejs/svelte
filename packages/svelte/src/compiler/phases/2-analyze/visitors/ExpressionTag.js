/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { is_tag_valid_with_parent } from '../../../../html-tree-validation.js';
import * as e from '../../../errors.js';
import { is_custom_element_node } from '../../nodes.js';
import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {AST.ExpressionTag} node
 * @param {Context} context
 */
export function ExpressionTag(node, context) {
	const in_template = context.path.at(-1)?.type === 'Fragment';

	if (in_template && context.state.parent_element) {
		const message = is_tag_valid_with_parent(
			{
				tag: '#text',
				custom_element: false
			},
			{
				tag: context.state.parent_element.name,
				custom_element: is_custom_element_node(context.state.parent_element)
			}
		);
		if (message) {
			e.node_invalid_placement(node, message);
		}
	}

	// TODO ideally we wouldn't do this here, we'd just do it on encountering
	// an `Identifier` within the tag. But we currently need to handle `{42}` etc
	mark_subtree_dynamic(context.path);

	context.next({ ...context.state, expression: node.metadata.expression });
}

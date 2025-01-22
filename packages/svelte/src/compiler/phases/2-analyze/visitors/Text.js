/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { is_tag_valid_with_parent } from '../../../../html-tree-validation.js';
import { regex_not_whitespace } from '../../patterns.js';
import * as e from '../../../errors.js';
import { is_custom_element_node } from '../../nodes.js';

/**
 * @param {AST.Text} node
 * @param {Context} context
 */
export function Text(node, context) {
	const in_template = context.path.at(-1)?.type === 'Fragment';

	if (in_template && context.state.parent_element && regex_not_whitespace.test(node.data)) {
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
}

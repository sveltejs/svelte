/** @import { Text } from '#compiler' */
/** @import { Context } from '../types' */
import { is_tag_valid_with_parent } from '../../../../html-tree-validation.js';
import { regex_not_whitespace } from '../../patterns.js';
import * as e from '../../../errors.js';

/**
 * @param {Text} node
 * @param {Context} context
 */
export function Text(node, context) {
	if (node.parent && context.state.parent_element && regex_not_whitespace.test(node.data)) {
		if (!is_tag_valid_with_parent('#text', context.state.parent_element)) {
			e.node_invalid_placement(node, 'Text node', context.state.parent_element);
		}
	}
}

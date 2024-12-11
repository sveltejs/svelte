/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { is_tag_valid_with_parent } from '../../../../html-tree-validation.js';
import { regex_not_whitespace } from '../../patterns.js';
import * as e from '../../../errors.js';

/**
 * @param {AST.Text} node
 * @param {Context} context
 */
export function Text(node, context) {
	const in_template = context.path.at(-1)?.type === 'Fragment';

	if (in_template && context.state.parent_element && regex_not_whitespace.test(node.data)) {
		const message = is_tag_valid_with_parent('#text', context.state.parent_element);
		if (message) {
			e.node_invalid_placement(node, message);
		}
	}
}

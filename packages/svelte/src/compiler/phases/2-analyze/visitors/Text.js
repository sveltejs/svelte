/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { is_tag_valid_with_parent } from '../../../../html-tree-validation.js';
import { regex_bidirectional_control_characters, regex_not_whitespace } from '../../patterns.js';
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';

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

	regex_bidirectional_control_characters.lastIndex = 0;
	for (const match of node.data.matchAll(regex_bidirectional_control_characters)) {
		let start = match.index + node.start;
		w.bidirectional_control_characters({ start, end: start + match[0].length });
	}

	// if (regex_bidirectional_control_characters.test(node.data)) {
	// 	w.bidirectional_control_characters(node);
	// }
}

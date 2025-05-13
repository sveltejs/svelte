/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { is_tag_valid_with_parent } from '../../../../html-tree-validation.js';
import { regex_bidirectional_control_characters, regex_not_whitespace } from '../../patterns.js';
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';
import { extract_svelte_ignore } from '../../../utils/extract_svelte_ignore.js';

/**
 * @param {AST.Text} node
 * @param {Context} context
 */
export function Text(node, context) {
	const parent = /** @type {AST.SvelteNode} */ (context.path.at(-1));

	if (
		parent.type === 'Fragment' &&
		context.state.parent_element &&
		regex_not_whitespace.test(node.data)
	) {
		const message = is_tag_valid_with_parent('#text', context.state.parent_element);
		if (message) {
			e.node_invalid_placement(node, message);
		}
	}

	regex_bidirectional_control_characters.lastIndex = 0;
	for (const match of node.data.matchAll(regex_bidirectional_control_characters)) {
		let is_ignored = false;

		// if we have a svelte-ignore comment earlier in the text, bail
		// (otherwise we can only use svelte-ignore on parent elements/blocks)
		if (parent.type === 'Fragment') {
			for (const child of parent.nodes) {
				if (child === node) break;

				if (child.type === 'Comment') {
					is_ignored ||= extract_svelte_ignore(
						child.start + 4,
						child.data,
						context.state.analysis.runes
					).includes('bidirectional_control_characters');
				}
			}
		}

		if (!is_ignored) {
			let start = match.index + node.start;
			w.bidirectional_control_characters({ start, end: start + match[0].length });
		}
	}
}

/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { mark_subtree_dynamic } from './shared/fragment.js';
import { validate_block_not_empty, validate_opening_tag } from './shared/utils.js';
import * as e from '../../../errors.js';

/**
 * @param {AST.SwitchBlock} node
 * @param {Context} context
 */
export function SwitchBlock(node, context) {
	mark_subtree_dynamic(context.path);
	node.consequences.forEach((consequence) => validate_block_not_empty(consequence, context));

	if (context.state.analysis.runes) {
		validate_opening_tag(node, context.state, '#');

		for (const value of node.values) {
			if (value === null) continue;

			const start = /** @type {number} */ (value.start);
			const match = context.state.analysis.source
				.substring(start - 10, start)
				.match(/{(\s*):case\s+$/);

			if (match && match[1] !== '') {
				// { :case ...} -- space after "{" not allowed
				e.block_unexpected_character({ start: start - 10, end: start }, ':');
			}
		}
	}

	context.next();
}

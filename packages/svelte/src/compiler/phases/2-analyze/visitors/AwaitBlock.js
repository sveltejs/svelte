/** @import { AwaitBlock } from '#compiler' */
/** @import { Context } from '../types' */
import { validate_block_not_empty, validate_opening_tag } from './shared/utils.js';
import * as e from '../../../errors.js';
import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {AwaitBlock} node
 * @param {Context} context
 */
export function AwaitBlock(node, context) {
	validate_block_not_empty(node.pending, context);
	validate_block_not_empty(node.then, context);
	validate_block_not_empty(node.catch, context);

	if (context.state.analysis.runes) {
		validate_opening_tag(node, context.state, '#');

		if (node.value) {
			const start = /** @type {number} */ (node.value.start);
			const match = context.state.analysis.source
				.substring(start - 10, start)
				.match(/{(\s*):then\s+$/);

			if (match && match[1] !== '') {
				e.block_unexpected_character({ start: start - 10, end: start }, ':');
			}
		}

		if (node.error) {
			const start = /** @type {number} */ (node.error.start);
			const match = context.state.analysis.source
				.substring(start - 10, start)
				.match(/{(\s*):catch\s+$/);

			if (match && match[1] !== '') {
				e.block_unexpected_character({ start: start - 10, end: start }, ':');
			}
		}
	}

	mark_subtree_dynamic(context.path);

	context.next();
}

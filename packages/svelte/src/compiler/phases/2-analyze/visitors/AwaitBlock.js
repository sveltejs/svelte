/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { validate_block_not_empty, validate_opening_tag } from './shared/utils.js';
import * as e from '../../../errors.js';
import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {AST.AwaitBlock} node
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

	// this one doesn't get the new state because it still hoists to the existing scope
	context.visit(node.expression, { ...context.state, expression: node.metadata.expression });

	if (node.pending) {
		context.visit(node.pending, {
			...context.state,
			async_hoist_boundary: node.pending
		});
	}
	if (node.then) {
		context.visit(node.then, {
			...context.state,
			async_hoist_boundary: node.then
		});
	}
	if (node.catch) {
		context.visit(node.catch, {
			...context.state,
			async_hoist_boundary: node.catch
		});
	}
}

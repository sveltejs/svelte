/** @import { AwaitBlock } from '#compiler' */
/** @import { Context } from '../types' */
import { validate_block_not_empty, validate_opening_tag } from './shared/utils.js';

/**
 * @param {AwaitBlock} node
 * @param {Context} context
 */
export function AwaitBlock(node, context) {
	validate_opening_tag(node, context.state, '#');

	validate_block_not_empty(node.pending, context);
	validate_block_not_empty(node.then, context);
	validate_block_not_empty(node.catch, context);
}

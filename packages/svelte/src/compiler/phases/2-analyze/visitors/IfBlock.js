/** @import { IfBlock } from '#compiler' */
/** @import { Context } from '../types' */
import { validate_block_not_empty, validate_opening_tag } from './shared/utils.js';

/**
 * @param {IfBlock} node
 * @param {Context} context
 */
export function IfBlock(node, context) {
	validate_opening_tag(node, context.state, '#');

	validate_block_not_empty(node.consequent, context);
	validate_block_not_empty(node.alternate, context);
}

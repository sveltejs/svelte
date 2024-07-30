/** @import { IfBlock } from '#compiler' */
/** @import { Context } from '../types' */
import { validate_block_not_empty, validate_opening_tag } from './shared/utils.js';

/**
 * @param {IfBlock} node
 * @param {Context} context
 */
export function IfBlock(node, context) {
	validate_block_not_empty(node.consequent, context);
	validate_block_not_empty(node.alternate, context);

	if (context.state.analysis.runes) {
		const parent = context.path.at(-1);
		const expected =
			context.path.at(-2)?.type === 'IfBlock' &&
			parent?.type === 'Fragment' &&
			parent.nodes.length === 1
				? ':'
				: '#';

		validate_opening_tag(node, context.state, expected);
	}

	context.next();
}

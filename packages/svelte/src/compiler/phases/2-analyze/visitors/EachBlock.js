/** @import { EachBlock } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import { validate_block_not_empty, validate_opening_tag } from './shared/utils.js';

/**
 * @param {EachBlock} node
 * @param {Context} context
 */
export function EachBlock(node, context) {
	validate_opening_tag(node, context.state, '#');

	validate_block_not_empty(node.body, context);
	validate_block_not_empty(node.fallback, context);

	const id = node.context;
	if (id.type === 'Identifier' && (id.name === '$state' || id.name === '$derived')) {
		// TODO weird that this is necessary
		e.state_invalid_placement(node, id.name);
	}

	if (node.key) {
		// treat `{#each items as item, i (i)}` as a normal indexed block, everything else as keyed
		node.metadata.keyed =
			node.key.type !== 'Identifier' || !node.index || node.key.name !== node.index;
	}

	context.next();
}

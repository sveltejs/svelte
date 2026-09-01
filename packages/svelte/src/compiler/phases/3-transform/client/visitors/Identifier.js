/** @import { Identifier, Node } from 'estree' */
/** @import { Context } from '../types' */
import is_reference from 'is-reference';
import * as b from '#compiler/builders';
import { build_getter } from '../utils.js';

/**
 * @param {Identifier} node
 * @param {Context} context
 */
export function Identifier(node, context) {
	const parent = /** @type {Node} */ (context.path.at(-1));

	if (is_reference(node, parent)) {
		if (node.name === '$$props') {
			return b.id('$$sanitized_props');
		}

		return build_getter(node, context.state);
	}
}

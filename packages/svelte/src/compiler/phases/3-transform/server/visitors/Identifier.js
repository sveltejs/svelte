/** @import { Identifier, Node } from 'estree' */
/** @import { Context } from '../types.js' */
import is_reference from 'is-reference';
import * as b from '#compiler/builders';
import { build_getter } from './shared/utils.js';

/**
 * @param {Identifier} node
 * @param {Context} context
 */
export function Identifier(node, context) {
	if (is_reference(node, /** @type {Node} */ (context.path.at(-1)))) {
		if (node.name === '$$props') {
			return b.id('$$sanitized_props');
		}

		return build_getter(node, context.state);
	}
}

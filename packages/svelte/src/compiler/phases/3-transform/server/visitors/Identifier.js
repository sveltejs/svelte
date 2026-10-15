/** @import { Identifier } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '#compiler/builders';
import { is_reference } from '../../../../utils/ast.js';
import { build_getter } from './shared/utils.js';

/**
 * @param {Identifier} node
 * @param {Context} context
 */
export function Identifier(node, context) {
	if (is_reference(node, context.path.at(-1))) {
		if (node.name === '$$props') {
			return b.id('$$sanitized_props');
		}

		if (node.name.startsWith('$$derived_array')) {
			// terrible hack, but easier than adding new stuff to `context.state` for now
			return b.call(node);
		}

		return build_getter(node, context.state);
	}
}

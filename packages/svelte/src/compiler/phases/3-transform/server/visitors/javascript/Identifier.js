/** @import { Identifier, Node } from 'estree' */
/** @import { Context } from '../../types' */
import is_reference from 'is-reference';
import * as b from '../../../../../utils/builders.js';
import { serialize_get_binding } from './shared/utils.js';

/**
 * @param {Identifier} node
 * @param {Context} context
 */
export function Identifier(node, { path, state }) {
	if (is_reference(node, /** @type {Node} */ (path.at(-1)))) {
		if (node.name === '$$props') {
			return b.id('$$sanitized_props');
		}

		return serialize_get_binding(node, state);
	}
}

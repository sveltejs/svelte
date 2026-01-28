/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */

import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {AST.SpreadAttribute} node
 * @param {Context} context
 */
export function SpreadAttribute(node, context) {
	mark_subtree_dynamic(context.path);
	context.next({ ...context.state, expression: node.metadata.expression });
}

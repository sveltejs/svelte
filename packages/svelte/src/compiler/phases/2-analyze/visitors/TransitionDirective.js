/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */

import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {AST.TransitionDirective} node
 * @param {Context} context
 */
export function TransitionDirective(node, context) {
	mark_subtree_dynamic(context.path);

	context.next();
}

/** @import { UseDirective } from '#compiler' */
/** @import { Context } from '../types' */
import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {UseDirective} node
 * @param {Context} context
 */
export function UseDirective(node, context) {
	mark_subtree_dynamic(context.path);
	context.next();
}

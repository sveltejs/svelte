/** @import { Comment } from '#compiler' */
/** @import { ComponentContext } from '../types' */

/**
 * @param {Comment} node
 * @param {ComponentContext} context
 */
export function Comment(node, context) {
	// We'll only get here if comments are not filtered out, which they are unless preserveComments is true
	context.state.template.push(`<!--${node.data}-->`);
}

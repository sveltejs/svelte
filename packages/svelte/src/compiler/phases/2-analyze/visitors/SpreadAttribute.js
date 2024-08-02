/** @import { SpreadAttribute } from '#compiler' */
/** @import { Context } from '../types' */

/**
 * @param {SpreadAttribute} node
 * @param {Context} context
 */
export function SpreadAttribute(node, context) {
	context.next({ ...context.state, expression: node.metadata.expression });
}

/** @import { SpreadAttribute } from '#compiler' */
/** @import { ComponentContext } from '../types' */

/**
 * @param {SpreadAttribute} node
 * @param {ComponentContext} context
 */
export function SpreadAttribute(node, context) {
	return context.visit(node.expression);
}

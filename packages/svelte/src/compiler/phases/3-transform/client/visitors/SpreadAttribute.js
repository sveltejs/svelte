/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */

/**
 * @param {AST.SpreadAttribute} node
 * @param {ComponentContext} context
 */
export function SpreadAttribute(node, context) {
	return context.visit(node.expression);
}

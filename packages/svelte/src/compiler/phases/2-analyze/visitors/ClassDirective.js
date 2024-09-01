/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */

/**
 * @param {AST.ClassDirective} node
 * @param {Context} context
 */
export function ClassDirective(node, context) {
	context.next({ ...context.state, expression: node.metadata.expression });
}

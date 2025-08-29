/** @import { AST } from '#compiler' */
/** @import { Context } from '../types.js' */

/**
 * @param {AST.Fragment} node
 * @param {Context} context
 */
export function Fragment(node, context) {
	context.next({ ...context.state, fragment: node });
}

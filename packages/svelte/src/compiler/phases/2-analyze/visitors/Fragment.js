/** @import { AST } from '#compiler' */
/** @import { Context } from '../types.js' */

/**
 * @param {AST.Fragment} node
 * @param {Context} context
 */
export function Fragment(node, context) {
	// node.metadata.consts.sync = [];
	// node.metadata.consts.async = [];
	// node.metadata.consts.promise_id = undefined;

	context.next({ ...context.state, fragment: node });
}

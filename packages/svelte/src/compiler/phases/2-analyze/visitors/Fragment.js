/** @import { AST } from '#compiler' */
/** @import { Context } from '../types.js' */

/**
 * @param {AST.Fragment} node
 * @param {Context} context
 */
export function Fragment(node, context) {
	const fragment_metadata = {
		has_await: false,
		node
	};
	context.next({ ...context.state, fragment: fragment_metadata });
	node.metadata.has_await = fragment_metadata.has_await;
}

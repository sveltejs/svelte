/** @import { AST } from '#compiler' */
/** @import { Context } from '../types.js' */

/**
 * @param {AST.Fragment} node
 * @param {Context} context
 */
export function Fragment(node, context) {
	const parent = /** @type {AST.TemplateNode} */ (context.path.at(-1));
	if (
		!parent ||
		parent.type === 'Component' ||
		parent.type === 'Root' ||
		parent.type === 'IfBlock' ||
		parent.type === 'KeyBlock' ||
		parent.type === 'EachBlock' ||
		parent.type === 'SnippetBlock' ||
		parent.type === 'AwaitBlock'
	) {
		const fragment_metadata = {
			has_await: false,
			node
		};
		context.next({ ...context.state, fragment: fragment_metadata });
		node.metadata.has_await = fragment_metadata.has_await;
	} else {
		context.next();
	}
}

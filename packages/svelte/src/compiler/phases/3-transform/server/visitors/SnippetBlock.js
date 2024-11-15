/** @import { BlockStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext, } from '../types.js' */
import * as b from '../../../../utils/builders.js';
import { can_hoist_snippet } from '../../utils.js';

/**
 * @param {AST.SnippetBlock} node
 * @param {ComponentContext} context
 */
export function SnippetBlock(node, context) {
	const fn = b.function_declaration(
		node.expression,
		[b.id('$$payload'), ...node.parameters],
		/** @type {BlockStatement} */ (context.visit(node.body))
	);

	// @ts-expect-error - TODO remove this hack once $$render_inner for legacy bindings is gone
	fn.___snippet = true;

	const can_hoist = can_hoist_snippet(node, context.state.scope, context.state.scopes);

	if (context.path.length === 1 && context.path[0].type === 'Fragment' && can_hoist) {
		context.state.hoisted.push(fn);
	} else {
		context.state.init.push(fn);
	}
}

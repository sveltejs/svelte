/** @import { BlockStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { dev } from '../../../../state.js';
import * as b from '../../../../utils/builders.js';

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
	if (dev) {
		fn.body.body.unshift(b.stmt(b.call('$.validate_snippet_args', b.id('$$payload'))));
	}
	// @ts-expect-error - TODO remove this hack once $$render_inner for legacy bindings is gone
	fn.___snippet = true;

	if (node.metadata.can_hoist) {
		context.state.hoisted.push(fn);
	} else {
		context.state.init.push(fn);
	}
}

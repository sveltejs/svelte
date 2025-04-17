/** @import { ArrowFunctionExpression, BlockStatement, CallExpression, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { dev } from '../../../../state.js';
import * as b from '#compiler/builders';

/**
 * @param {AST.SnippetBlock} node
 * @param {ComponentContext} context
 */
export function SnippetBlock(node, context) {
	const body = /** @type {BlockStatement} */ (context.visit(node.body));

	if (dev) {
		body.body.unshift(b.stmt(b.call('$.validate_snippet_args', b.id('$$payload'))));
	}

	let fn = b.function_declaration(
		node.expression,
		[b.id('$$payload'), ...node.parameters],
		/** @type {BlockStatement} */ (context.visit(node.body))
	);

	const push_to = node.metadata.can_hoist ? context.state.hoisted : context.state.init;

	if (dev) {
		push_to.push(b.stmt(b.call('$.prevent_snippet_stringification', fn.id)));
	}

	// @ts-expect-error - TODO remove this hack once $$render_inner for legacy bindings is gone
	fn.___snippet = true;

	if (node.metadata.can_hoist) {
		push_to.push(fn);
	} else {
		push_to.push(fn);
	}
}

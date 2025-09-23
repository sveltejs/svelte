/** @import { BlockStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { dev } from '../../../../state.js';
import * as b from '#compiler/builders';
import { create_async_block } from './shared/utils.js';

/**
 * @param {AST.SnippetBlock} node
 * @param {ComponentContext} context
 */
export function SnippetBlock(node, context) {
	let fn = b.function_declaration(
		node.expression,
		[b.id('$$renderer'), ...node.parameters],
		/** @type {BlockStatement} */ (context.visit(node.body))
	);

	if (node.body.metadata.has_await) {
		fn.body = b.block([create_async_block(fn.body)]);
	}

	// @ts-expect-error - TODO remove this hack once $$render_inner for legacy bindings is gone
	fn.___snippet = true;

	const statements = node.metadata.can_hoist ? context.state.hoisted : context.state.init;

	if (dev) {
		fn.body.body.unshift(b.stmt(b.call('$.validate_snippet_args', b.id('$$renderer'))));
		statements.push(b.stmt(b.call('$.prevent_snippet_stringification', fn.id)));
	}

	statements.push(fn);
}

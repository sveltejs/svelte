/** @import { ArrowFunctionExpression, BlockStatement, CallExpression } from 'estree' */
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

	/** @type {ArrowFunctionExpression | CallExpression} */
	let fn = b.arrow([b.id('$$payload'), ...node.parameters], body);

	if (dev) {
		fn = b.call('$.prevent_snippet_stringification', fn);
	}

	const declaration = b.declaration('const', [b.declarator(node.expression, fn)]);

	// @ts-expect-error - TODO remove this hack once $$render_inner for legacy bindings is gone
	fn.___snippet = true;

	if (node.metadata.can_hoist) {
		context.state.hoisted.push(declaration);
	} else {
		context.state.init.push(declaration);
	}
}

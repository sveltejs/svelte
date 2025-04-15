/** @import { ArrowFunctionExpression, BlockStatement, CallExpression, ModuleDeclaration, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { DEV } from 'esm-env';
import * as b from '../../../../utils/builders.js';

/**
 * @param {AST.SnippetBlock} node
 * @param {ComponentContext} context
 */
export function SnippetBlock(node, context) {
	/** @type {ArrowFunctionExpression | CallExpression} */
	let fn = b.arrow(
		[b.id('$$payload'), ...node.parameters],
		/** @type {BlockStatement} */ (context.visit(node.body))
	);

	if (DEV) {
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

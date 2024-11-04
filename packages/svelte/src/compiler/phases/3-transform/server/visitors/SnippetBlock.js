/** @import { BlockStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { is_reserved } from '../../../../../utils.js';
import * as b from '../../../../utils/builders.js';

/**
 * @param {AST.SnippetBlock} node
 * @param {ComponentContext} context
 */
export function SnippetBlock(node, context) {
	const id_expression =
		node.expression.type === 'Identifier' && is_reserved(node.expression.name)
			? b.id(`$_${node.expression.name}`)
			: node.expression;

	const fn = b.function_declaration(
		id_expression,
		[b.id('$$payload'), ...node.parameters],
		/** @type {BlockStatement} */ (context.visit(node.body))
	);

	// @ts-expect-error - TODO remove this hack once $$render_inner for legacy bindings is gone
	fn.___snippet = true;

	// TODO hoist where possible
	context.state.init.push(fn);
}

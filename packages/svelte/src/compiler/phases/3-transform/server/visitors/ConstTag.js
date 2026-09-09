/** @import { Expression, Pattern } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { extract_identifiers } from '../../../../utils/ast.js';
import { add_async_declaration } from './DeclarationTag.js';

/**
 * @param {AST.ConstTag} node
 * @param {ComponentContext} context
 */
export function ConstTag(node, context) {
	const declaration = node.declaration.declarations[0];
	const id = /** @type {Pattern} */ (context.visit(declaration.id));
	const init = /** @type {Expression} */ (context.visit(declaration.init));

	if (node.metadata.promises_id) {
		add_async_declaration(
			context,
			node.metadata,
			extract_identifiers(id),
			[b.stmt(b.assignment('=', id, init))],
			'let'
		);
	} else {
		context.state.init.push(b.const(id, init));
	}
}

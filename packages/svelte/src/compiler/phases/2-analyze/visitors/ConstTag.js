/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import { validate_opening_tag, validate_tag_placement } from './shared/utils.js';
import { mark_async_declaration } from './DeclarationTag.js';

/**
 * @param {AST.ConstTag} node
 * @param {Context} context
 */
export function ConstTag(node, context) {
	if (context.state.analysis.runes) {
		validate_opening_tag(node, context.state, '@');
	}

	validate_tag_placement(node, context, e.const_tag_invalid_placement);

	const declaration = node.declaration.declarations[0];

	context.visit(declaration.id);
	context.visit(declaration.init, {
		...context.state,
		expression: node.metadata.expression,
		// We're treating this like a $derived under the hood
		function_depth: context.state.function_depth + 1,
		derived_function_depth: context.state.function_depth + 1
	});

	mark_async_declaration(context, node.metadata, [declaration]);
}

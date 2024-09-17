/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { unwrap_optional } from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';
import { empty_comment } from './shared/utils.js';

/**
 * @param {AST.RenderTag} node
 * @param {ComponentContext} context
 */
export function RenderTag(node, context) {
	const callee = unwrap_optional(node.expression).callee;
	const raw_args = unwrap_optional(node.expression).arguments;

	const snippet_function = /** @type {Expression} */ (context.visit(callee));

	const snippet_args = raw_args.map((arg) => {
		return /** @type {Expression} */ (context.visit(arg));
	});

	context.state.template.push(
		b.stmt(
			(node.expression.type === 'CallExpression' ? b.call : b.maybe_call)(
				snippet_function,
				b.id('$$payload'),
				...snippet_args
			)
		)
	);

	if (!context.state.skip_hydration_boundaries) {
		context.state.template.push(empty_comment);
	}
}

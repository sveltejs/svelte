/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { unwrap_optional } from '../../../../utils/ast.js';
import * as b from '#compiler/builders';
import { create_async_block, empty_comment, PromiseOptimiser } from './shared/utils.js';

/**
 * @param {AST.RenderTag} node
 * @param {ComponentContext} context
 */
export function RenderTag(node, context) {
	const optimiser = new PromiseOptimiser();

	const callee = unwrap_optional(node.expression).callee;
	const raw_args = unwrap_optional(node.expression).arguments;

	const snippet_function = optimiser.transform(
		/** @type {Expression} */ (context.visit(callee)),
		node.metadata.expression
	);

	const snippet_args = raw_args.map((arg, i) => {
		return optimiser.transform(
			/** @type {Expression} */ (context.visit(arg)),
			node.metadata.arguments[i]
		);
	});

	let statement = b.stmt(
		(node.expression.type === 'CallExpression' ? b.call : b.maybe_call)(
			snippet_function,
			b.id('$$renderer'),
			...snippet_args
		)
	);

	if (optimiser.is_async()) {
		statement = create_async_block(
			b.block([optimiser.apply(), statement]),
			optimiser.blockers(),
			optimiser.has_await
		);
	}

	context.state.template.push(statement);

	if (!context.state.skip_hydration_boundaries) {
		context.state.template.push(empty_comment);
	}
}

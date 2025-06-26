/** @import { Expression, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext, MemoizedExpression } from '../types' */
import { unwrap_optional } from '../../../../utils/ast.js';
import * as b from '#compiler/builders';
import { create_derived } from '../utils.js';
import { get_expression_id, build_expression } from './shared/utils.js';

/**
 * @param {AST.RenderTag} node
 * @param {ComponentContext} context
 */
export function RenderTag(node, context) {
	context.state.template.push_comment();

	const call = unwrap_optional(node.expression);

	/** @type {Expression[]} */
	let args = [];

	/** @type {MemoizedExpression[]} */
	const expressions = [];

	/** @type {MemoizedExpression[]} */
	const async_expressions = [];

	for (let i = 0; i < call.arguments.length; i++) {
		const arg = /** @type {Expression} */ (call.arguments[i]);
		const metadata = node.metadata.arguments[i];

		let expression = build_expression(context, arg, metadata);

		if (metadata.has_await || metadata.has_call) {
			expression = b.call(
				'$.get',
				get_expression_id(metadata.has_await ? async_expressions : expressions, expression)
			);
		}

		args.push(b.thunk(expression));
	}

	[...async_expressions, ...expressions].forEach((memo, i) => {
		memo.id.name = `$${i}`;
	});

	/** @type {Statement[]} */
	const statements = expressions.map((memo) =>
		b.var(memo.id, create_derived(context.state, b.thunk(memo.expression)))
	);

	let snippet_function = build_expression(
		context,
		/** @type {Expression} */ (call.callee),
		node.metadata.expression
	);

	if (node.metadata.dynamic) {
		// If we have a chain expression then ensure a nullish snippet function gets turned into an empty one
		if (node.expression.type === 'ChainExpression') {
			snippet_function = b.logical('??', snippet_function, b.id('$.noop'));
		}

		statements.push(
			b.stmt(b.call('$.snippet', context.state.node, b.thunk(snippet_function), ...args))
		);
	} else {
		statements.push(
			b.stmt(
				(node.expression.type === 'CallExpression' ? b.call : b.maybe_call)(
					snippet_function,
					context.state.node,
					...args
				)
			)
		);
	}

	if (async_expressions.length > 0) {
		context.state.init.push(
			b.stmt(
				b.call(
					'$.async',
					context.state.node,
					b.array(async_expressions.map((memo) => b.thunk(memo.expression, true))),
					b.arrow(
						[context.state.node, ...async_expressions.map((memo) => memo.id)],
						b.block(statements)
					)
				)
			)
		);
	} else {
		context.state.init.push(statements.length === 1 ? statements[0] : b.block(statements));
	}
}

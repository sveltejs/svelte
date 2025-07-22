/** @import { Expression, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { unwrap_optional } from '../../../../utils/ast.js';
import * as b from '#compiler/builders';
import { add_svelte_meta, build_expression, Memoizer } from './shared/utils.js';

/**
 * @param {AST.RenderTag} node
 * @param {ComponentContext} context
 */
export function RenderTag(node, context) {
	context.state.template.push_comment();

	const call = unwrap_optional(node.expression);

	/** @type {Expression[]} */
	let args = [];

	const memoizer = new Memoizer();

	for (let i = 0; i < call.arguments.length; i++) {
		const arg = /** @type {Expression} */ (call.arguments[i]);
		const metadata = node.metadata.arguments[i];

		let expression = build_expression(context, arg, metadata);

		if (metadata.has_await || metadata.has_call) {
			expression = b.call('$.get', memoizer.add(expression, metadata.has_await));
		}

		args.push(b.thunk(expression));
	}

	memoizer.apply();

	/** @type {Statement[]} */
	const statements = memoizer.deriveds(context.state.analysis.runes);

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
			add_svelte_meta(
				b.call('$.snippet', context.state.node, b.thunk(snippet_function), ...args),
				node,
				'render'
			)
		);
	} else {
		statements.push(
			add_svelte_meta(
				(node.expression.type === 'CallExpression' ? b.call : b.maybe_call)(
					snippet_function,
					context.state.node,
					...args
				),
				node,
				'render'
			)
		);
	}

	const async_values = memoizer.async_values();

	if (async_values) {
		context.state.init.push(
			b.stmt(
				b.call(
					'$.async',
					context.state.node,
					memoizer.async_values(),
					b.arrow([context.state.node, ...memoizer.async_ids()], b.block(statements))
				)
			)
		);
	} else {
		context.state.init.push(statements.length === 1 ? statements[0] : b.block(statements));
	}
}

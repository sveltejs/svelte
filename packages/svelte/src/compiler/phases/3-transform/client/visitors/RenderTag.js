/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { unwrap_optional } from '../../../../utils/ast.js';
import * as b from '#compiler/builders';
import { add_svelte_meta, build_expression } from './shared/utils.js';

/**
 * @param {AST.RenderTag} node
 * @param {ComponentContext} context
 */
export function RenderTag(node, context) {
	context.state.template.push_comment();

	const expression = unwrap_optional(node.expression);

	const callee = expression.callee;
	const raw_args = expression.arguments;

	/** @type {Expression[]} */
	let args = [];
	for (let i = 0; i < raw_args.length; i++) {
		let thunk = b.thunk(
			build_expression(context, /** @type {Expression} */ (raw_args[i]), node.metadata.arguments[i])
		);

		const { has_call } = node.metadata.arguments[i];

		if (has_call) {
			const id = b.id(context.state.scope.generate('render_arg'));
			context.state.init.push(b.var(id, b.call('$.derived_safe_equal', thunk)));
			args.push(b.thunk(b.call('$.get', id)));
		} else {
			args.push(thunk);
		}
	}

	let snippet_function = build_expression(
		context,
		/** @type {Expression} */ (callee),
		node.metadata.expression
	);

	if (node.metadata.dynamic) {
		// If we have a chain expression then ensure a nullish snippet function gets turned into an empty one
		if (node.expression.type === 'ChainExpression') {
			snippet_function = b.logical('??', snippet_function, b.id('$.noop'));
		}

		context.state.init.push(
			add_svelte_meta(
				b.call('$.snippet', context.state.node, b.thunk(snippet_function), ...args),
				node,
				'render'
			)
		);
	} else {
		context.state.init.push(
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
}

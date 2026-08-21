/** @import { AST } from '#compiler' */
/** @import { ComponentContext, ComponentServerTransformState } from '../types.js' */
import { clean_nodes, infer_namespace } from '../../utils.js';
import * as b from '#compiler/builders';
import { empty_comment, process_children, build_template } from './shared/utils.js';

/**
 * @param {AST.Fragment} node
 * @param {ComponentContext} context
 */
export function Fragment(node, context) {
	const parent = context.path.at(-1) ?? node;
	const namespace = infer_namespace(context.state.namespace, parent, node.nodes);

	const { hoisted, trimmed, is_standalone, is_text_first } = clean_nodes(
		parent,
		node.nodes,
		context.path,
		namespace,
		context.state,
		context.state.preserve_whitespace,
		context.state.options.preserveComments
	);

	/** @type {ComponentServerTransformState} */
	const state = {
		...context.state,
		init: [],
		template: [],
		namespace,
		is_standalone,
		async_consts: undefined
	};

	for (const node of hoisted) {
		context.visit(node, state);
	}

	if (is_text_first) {
		// insert `<!---->` to prevent this from being glued to the previous fragment
		state.template.push(empty_comment);
	}

	process_children(trimmed, { ...context, state });

	if (state.async_consts && state.async_consts.thunks.length > 0) {
		state.init.push(
			b.var(state.async_consts.id, b.call('$$renderer.run', b.array(state.async_consts.thunks)))
		);
	}

	return b.block([...state.init, ...build_template(state.template)]);
}

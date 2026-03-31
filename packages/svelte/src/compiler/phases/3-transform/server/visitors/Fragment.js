/** @import { AST } from '#compiler' */
/** @import { ComponentContext, ComponentServerTransformState } from '../types.js' */
import { clean_nodes, infer_namespace } from '../../utils.js';
import * as b from '#compiler/builders';
import { serialize_async_const_tag, serialize_sync_const_tag } from './ConstTag.js';
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
		is_standalone
	};

	for (const const_tag of node.metadata.consts.sync) {
		state.init.push(...serialize_sync_const_tag(const_tag, { ...context, state }));
	}

	for (const const_tag of node.metadata.consts.sync_duplicated) {
		state.init.push(...serialize_sync_const_tag(const_tag, { ...context, state }));
	}

	const promise_id = node.metadata.consts.promise_id;
	if (promise_id && node.metadata.consts.async.length > 0) {
		/** @type {import('estree').Expression[]} */
		const thunks = [];

		for (const const_tag of node.metadata.consts.async) {
			const { declarations, thunk } = serialize_async_const_tag(
				const_tag,
				{ ...context, state },
				promise_id
			);
			state.init.push(...declarations);
			thunks.push(thunk);
		}

		state.init.push(b.var(promise_id, b.call('$$renderer.run', b.array(thunks))));
	}

	for (const node of hoisted) {
		if (node.type === 'ConstTag') continue;
		context.visit(node, state);
	}

	if (is_text_first) {
		// insert `<!---->` to prevent this from being glued to the previous fragment
		state.template.push(empty_comment);
	}

	process_children(trimmed, { ...context, state });

	return b.block([...state.init, ...build_template(state.template)]);
}

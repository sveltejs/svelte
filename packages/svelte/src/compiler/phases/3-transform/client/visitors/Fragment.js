/** @import { Expression, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentClientTransformState, ComponentContext } from '../types' */
import { TEMPLATE_FRAGMENT, TEMPLATE_USE_IMPORT_NODE } from '../../../../../constants.js';
import * as b from '#compiler/builders';
import { clean_nodes, infer_namespace } from '../../utils.js';
import { transform_template } from '../transform-template/index.js';
import { process_children } from './shared/fragment.js';
import { build_render_statement } from './shared/utils.js';
import { Template } from '../transform-template/template.js';

/**
 * @param {AST.Fragment} node
 * @param {ComponentContext} context
 */
export function Fragment(node, context) {
	// Creates a new block which looks roughly like this:
	// ```js
	// // hoisted:
	// const block_name = $.from_html(`...`);
	//
	// // for the main block:
	// const id = block_name();
	// // init stuff and possibly render effect
	// $.append($$anchor, id);
	// ```
	// Adds the hoisted parts to `context.state.hoisted` and returns the statements of the main block.

	const parent = context.path.at(-1) ?? node;

	const namespace = infer_namespace(context.state.metadata.namespace, parent, node.nodes);

	const { hoisted, trimmed, is_standalone, is_text_first } = clean_nodes(
		parent,
		node.nodes,
		context.path,
		namespace,
		context.state,
		context.state.preserve_whitespace,
		context.state.options.preserveComments
	);

	if (hoisted.length === 0 && trimmed.length === 0) {
		return b.block([]);
	}

	const is_single_element = trimmed.length === 1 && trimmed[0].type === 'RegularElement';
	const is_single_child_not_needing_template =
		trimmed.length === 1 &&
		(trimmed[0].type === 'SvelteFragment' ||
			trimmed[0].type === 'TitleElement' ||
			(trimmed[0].type === 'IfBlock' && trimmed[0].elseif));

	const template_name = context.state.scope.root.unique('root'); // TODO infer name from parent

	/** @type {Statement[]} */
	const body = [];

	/** @type {Statement | undefined} */
	let close = undefined;

	/** @type {ComponentClientTransformState} */
	const state = {
		...context.state,
		init: [],
		update: [],
		expressions: [],
		after_update: [],
		template: new Template(),
		transform: { ...context.state.transform },
		metadata: {
			namespace,
			bound_contenteditable: context.state.metadata.bound_contenteditable
		}
	};

	for (const node of hoisted) {
		context.visit(node, state);
	}

	if (is_text_first) {
		// skip over inserted comment
		body.push(b.stmt(b.call('$.next')));
	}

	if (is_single_element) {
		const element = /** @type {AST.RegularElement} */ (trimmed[0]);

		const id = b.id(context.state.scope.generate(element.name));

		context.visit(element, {
			...state,
			node: id
		});

		let flags = state.template.needs_import_node ? TEMPLATE_USE_IMPORT_NODE : undefined;

		const template = transform_template(state, namespace, flags);
		state.hoisted.push(b.var(template_name, template));

		body.push(b.var(id, b.call(template_name)));
		close = b.stmt(b.call('$.append', b.id('$$anchor'), id));
	} else if (is_single_child_not_needing_template) {
		context.visit(trimmed[0], state);
	} else if (trimmed.length === 1 && trimmed[0].type === 'Text') {
		const id = b.id(context.state.scope.generate('text'));
		body.push(b.var(id, b.call('$.text', b.literal(trimmed[0].data))));
		close = b.stmt(b.call('$.append', b.id('$$anchor'), id));
	} else if (trimmed.length > 0) {
		const id = b.id(context.state.scope.generate('fragment'));

		const use_space_template =
			trimmed.some((node) => node.type === 'ExpressionTag') &&
			trimmed.every((node) => node.type === 'Text' || node.type === 'ExpressionTag');

		if (use_space_template) {
			// special case — we can use `$.text` instead of creating a unique template
			const id = b.id(context.state.scope.generate('text'));

			process_children(trimmed, () => id, false, {
				...context,
				state
			});

			body.push(b.var(id, b.call('$.text')));
			close = b.stmt(b.call('$.append', b.id('$$anchor'), id));
		} else {
			if (is_standalone) {
				// no need to create a template, we can just use the existing block's anchor
				process_children(trimmed, () => b.id('$$anchor'), false, { ...context, state });
			} else {
				/** @type {(is_text: boolean) => Expression} */
				const expression = (is_text) => b.call('$.first_child', id, is_text && b.true);

				process_children(trimmed, expression, false, { ...context, state });

				let flags = TEMPLATE_FRAGMENT;

				if (state.template.needs_import_node) {
					flags |= TEMPLATE_USE_IMPORT_NODE;
				}

				if (state.template.nodes.length === 1 && state.template.nodes[0].type === 'comment') {
					// special case — we can use `$.comment` instead of creating a unique template
					body.push(b.var(id, b.call('$.comment')));
				} else {
					const template = transform_template(state, namespace, flags);
					state.hoisted.push(b.var(template_name, template));

					body.push(b.var(id, b.call(template_name)));
				}

				close = b.stmt(b.call('$.append', b.id('$$anchor'), id));
			}
		}
	}

	body.push(...state.init);

	if (state.update.length > 0) {
		body.push(build_render_statement(state));
	}

	body.push(...state.after_update);

	if (close !== undefined) {
		// It's important that close is the last statement in the block, as any previous statements
		// could contain element insertions into the template, which the close statement needs to
		// know of when constructing the list of current inner elements.
		body.push(close);
	}

	return b.block(body);
}

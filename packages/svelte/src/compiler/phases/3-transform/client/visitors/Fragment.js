/** @import { Expression, Identifier, Statement } from 'estree' */
/** @import { Fragment, Namespace, RegularElement } from '#compiler' */
/** @import { SourceLocation } from '#shared' */
/** @import { ComponentClientTransformState, ComponentContext } from '../types' */
import { TEMPLATE_FRAGMENT, TEMPLATE_USE_IMPORT_NODE } from '../../../../../constants.js';
import { dev } from '../../../../state.js';
import * as b from '../../../../utils/builders.js';
import { clean_nodes, infer_namespace } from '../../utils.js';
import { process_children } from './shared/fragment.js';
import { build_render_statement } from './shared/utils.js';

/**
 * @param {Fragment} node
 * @param {ComponentContext} context
 */
export function Fragment(node, context) {
	// Creates a new block which looks roughly like this:
	// ```js
	// // hoisted:
	// const block_name = $.template(`...`);
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
		(trimmed[0].type === 'SvelteFragment' || trimmed[0].type === 'TitleElement');

	const template_name = context.state.scope.root.unique('root'); // TODO infer name from parent

	/** @type {Statement[]} */
	const body = [];

	/** @type {Statement | undefined} */
	let close = undefined;

	/** @type {ComponentClientTransformState} */
	const state = {
		...context.state,
		before_init: [],
		init: [],
		update: [],
		after_update: [],
		template: [],
		locations: [],
		transform: { ...context.state.transform },
		metadata: {
			context: {
				template_needs_import_node: false,
				template_contains_script_tag: false
			},
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

	/**
	 * @param {Identifier} template_name
	 * @param {Expression[]} args
	 */
	const add_template = (template_name, args) => {
		let call = b.call(get_template_function(namespace, state), ...args);
		if (dev) {
			call = b.call(
				'$.add_locations',
				call,
				b.member(b.id(context.state.analysis.name), b.id('$.FILENAME'), true),
				build_locations(state.locations)
			);
		}

		context.state.hoisted.push(b.var(template_name, call));
	};

	if (is_single_element) {
		const element = /** @type {RegularElement} */ (trimmed[0]);

		const id = b.id(context.state.scope.generate(element.name));

		context.visit(element, {
			...state,
			node: id
		});

		/** @type {Expression[]} */
		const args = [b.template([b.quasi(state.template.join(''), true)], [])];

		if (state.metadata.context.template_needs_import_node) {
			args.push(b.literal(TEMPLATE_USE_IMPORT_NODE));
		}

		add_template(template_name, args);

		body.push(b.var(id, b.call(template_name)), ...state.before_init, ...state.init);
		close = b.stmt(b.call('$.append', b.id('$$anchor'), id));
	} else if (is_single_child_not_needing_template) {
		context.visit(trimmed[0], state);
		body.push(...state.before_init, ...state.init);
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

			body.push(b.var(id, b.call('$.text')), ...state.before_init, ...state.init);
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

				if (state.metadata.context.template_needs_import_node) {
					flags |= TEMPLATE_USE_IMPORT_NODE;
				}

				if (state.template.length === 1 && state.template[0] === '<!>') {
					// special case — we can use `$.comment` instead of creating a unique template
					body.push(b.var(id, b.call('$.comment')));
				} else {
					add_template(template_name, [
						b.template([b.quasi(state.template.join(''), true)], []),
						b.literal(flags)
					]);

					body.push(b.var(id, b.call(template_name)));
				}

				close = b.stmt(b.call('$.append', b.id('$$anchor'), id));
			}

			body.push(...state.before_init, ...state.init);
		}
	} else {
		body.push(...state.before_init, ...state.init);
	}

	if (state.update.length > 0) {
		body.push(build_render_statement(state.update));
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

/**
 *
 * @param {Namespace} namespace
 * @param {ComponentClientTransformState} state
 * @returns
 */
function get_template_function(namespace, state) {
	const contains_script_tag = state.metadata.context.template_contains_script_tag;
	return namespace === 'svg'
		? contains_script_tag
			? '$.svg_template_with_script'
			: '$.ns_template'
		: namespace === 'mathml'
			? '$.mathml_template'
			: contains_script_tag
				? '$.template_with_script'
				: '$.template';
}

/**
 * @param {SourceLocation[]} locations
 */
function build_locations(locations) {
	return b.array(
		locations.map((loc) => {
			const expression = b.array([b.literal(loc[0]), b.literal(loc[1])]);

			if (loc.length === 3) {
				expression.elements.push(build_locations(loc[2]));
			}

			return expression;
		})
	);
}

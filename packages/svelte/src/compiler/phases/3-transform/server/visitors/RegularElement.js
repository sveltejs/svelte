/** @import { Expression } from 'estree' */
/** @import { Location } from 'locate-character' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext, ComponentServerTransformState } from '../types.js' */
/** @import { Scope } from '../../../scope.js' */
import { is_void } from '../../../../../utils.js';
import { dev, locator } from '../../../../state.js';
import * as b from '#compiler/builders';
import { clean_nodes, determine_namespace_for_children } from '../../utils.js';
import { build_element_attributes, prepare_element_spread_object } from './shared/element.js';
import {
	process_children,
	build_template,
	create_child_block,
	PromiseOptimiser
} from './shared/utils.js';

/**
 * @param {AST.RegularElement} node
 * @param {ComponentContext} context
 */
export function RegularElement(node, context) {
	const namespace = determine_namespace_for_children(node, context.state.namespace);

	/** @type {ComponentServerTransformState} */
	const state = {
		...context.state,
		namespace,
		preserve_whitespace:
			context.state.preserve_whitespace || node.name === 'pre' || node.name === 'textarea',
		init: [],
		template: []
	};

	const node_is_void = is_void(node.name);

	const optimiser = new PromiseOptimiser();

	// If this element needs special handling (like <select value> / <option>),
	// avoid calling build_element_attributes here to prevent evaluating/awaiting
	// attribute expressions twice. We'll handle attributes in the special branch.
	const is_select_special =
		node.name === 'select' &&
		node.attributes.some(
			(attribute) =>
				((attribute.type === 'Attribute' || attribute.type === 'BindDirective') &&
					attribute.name === 'value') ||
				attribute.type === 'SpreadAttribute'
		);
	const is_option_special = node.name === 'option';
	const is_special = is_select_special || is_option_special;

	let body = /** @type {Expression | null} */ (null);
	if (!is_special) {
		// only open the tag in the non-special path
		state.template.push(b.literal(`<${node.name}`));
		body = build_element_attributes(node, { ...context, state }, optimiser.transform);
		state.template.push(b.literal(node_is_void ? '/>' : '>')); // add `/>` for XHTML compliance
	}

	if ((node.name === 'script' || node.name === 'style') && node.fragment.nodes.length === 1) {
		state.template.push(
			b.literal(/** @type {AST.Text} */ (node.fragment.nodes[0]).data),
			b.literal(`</${node.name}>`)
		);

		// TODO this is a real edge case, would be good to DRY this out
		if (optimiser.expressions.length > 0) {
			context.state.template.push(
				create_child_block(
					b.block([optimiser.apply(), ...state.init, ...build_template(state.template)]),
					true
				)
			);
		} else {
			context.state.init.push(...state.init);
			context.state.template.push(...state.template);
		}

		return;
	}

	const { hoisted, trimmed } = clean_nodes(
		node,
		node.fragment.nodes,
		context.path,
		namespace,
		{
			...state,
			scope: /** @type {Scope} */ (state.scopes.get(node.fragment))
		},
		state.preserve_whitespace,
		state.options.preserveComments
	);

	for (const node of hoisted) {
		context.visit(node, state);
	}

	if (dev) {
		const location = /** @type {Location} */ (locator(node.start));
		state.template.push(
			b.stmt(
				b.call(
					'$.push_element',
					b.id('$$renderer'),
					b.literal(node.name),
					b.literal(location.line),
					b.literal(location.column)
				)
			)
		);
	}

	if (is_select_special) {
		const inner_state = { ...state, template: [], init: [] };
		process_children(trimmed, { ...context, state: inner_state });

		const fn = b.arrow(
			[b.id('$$renderer')],
			b.block([...state.init, ...build_template(inner_state.template)])
		);

		const [attributes, ...rest] = prepare_element_spread_object(node, context, optimiser.transform);

		const statement = b.stmt(b.call('$$renderer.select', attributes, fn, ...rest));

		if (optimiser.expressions.length > 0) {
			context.state.template.push(
				create_child_block(b.block([optimiser.apply(), ...state.init, statement]), true)
			);
		} else {
			context.state.template.push(...state.init, statement);
		}

		return;
	}

	if (is_option_special) {
		let body;

		if (node.metadata.synthetic_value_node) {
			body = optimiser.transform(
				node.metadata.synthetic_value_node.expression,
				node.metadata.synthetic_value_node.metadata.expression
			);
		} else {
			const inner_state = { ...state, template: [], init: [] };
			process_children(trimmed, { ...context, state: inner_state });

			body = b.arrow(
				[b.id('$$renderer')],
				b.block([...state.init, ...build_template(inner_state.template)])
			);
		}

		const [attributes, ...rest] = prepare_element_spread_object(node, context, optimiser.transform);

		const statement = b.stmt(b.call('$$renderer.option', attributes, body, ...rest));

		if (optimiser.expressions.length > 0) {
			context.state.template.push(
				create_child_block(b.block([optimiser.apply(), ...state.init, statement]), true)
			);
		} else {
			context.state.template.push(...state.init, statement);
		}

		return;
	}

	if (body !== null) {
		// if this is a `<textarea>` value or a contenteditable binding, we only add
		// the body if the attribute/binding is falsy
		const inner_state = { ...state, template: [], init: [] };
		process_children(trimmed, { ...context, state: inner_state });

		let id = /** @type {Expression} */ (body);

		if (body.type !== 'Identifier') {
			id = b.id(state.scope.generate('$$body'));
			state.template.push(b.const(id, body));
		}

		// Use the body expression as the body if it's truthy, otherwise use the inner template
		state.template.push(
			b.if(
				id,
				b.block(build_template([id])),
				b.block([...inner_state.init, ...build_template(inner_state.template)])
			)
		);
	} else {
		process_children(trimmed, { ...context, state });
	}

	if (!node_is_void) {
		state.template.push(b.literal(`</${node.name}>`));
	}

	if (dev) {
		state.template.push(b.stmt(b.call('$.pop_element')));
	}

	if (optimiser.expressions.length > 0) {
		context.state.template.push(
			create_child_block(
				b.block([optimiser.apply(), ...state.init, ...build_template(state.template)]),
				true
			)
		);
	} else {
		context.state.init.push(...state.init);
		context.state.template.push(...state.template);
	}
}

/** @import { Location } from 'locate-character' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext, ComponentServerTransformState } from '../types.js' */
/** @import { Scope } from '../../../scope.js' */
import { is_void } from '../../../../../utils.js';
import { dev, locator } from '../../../../state.js';
import * as b from '#compiler/builders';
import { clean_nodes, determine_namespace_for_children } from '../../utils.js';
import { build_element_attributes } from './shared/element.js';
import { process_children, build_template } from './shared/utils.js';

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
			context.state.preserve_whitespace || node.name === 'pre' || node.name === 'textarea'
	};

	context.state.template.push(b.literal(`<${node.name}`));
	const body = build_element_attributes(node, { ...context, state });
	context.state.template.push(b.literal('>'));

	if ((node.name === 'script' || node.name === 'style') && node.fragment.nodes.length === 1) {
		context.state.template.push(
			b.literal(/** @type {AST.Text} */ (node.fragment.nodes[0]).data),
			b.literal(`</${node.name}>`)
		);

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
					b.id('$$payload'),
					b.literal(node.name),
					b.literal(location.line),
					b.literal(location.column)
				)
			)
		);
	}

	if (body === null) {
		process_children(trimmed, { ...context, state });
	} else {
		let id = body;

		if (body.type !== 'Identifier') {
			id = b.id(state.scope.generate('$$body'));
			state.template.push(b.const(id, body));
		}

		// if this is a `<textarea>` value or a contenteditable binding, we only add
		// the body if the attribute/binding is falsy
		const inner_state = { ...state, template: [], init: [] };
		process_children(trimmed, { ...context, state: inner_state });

		// Use the body expression as the body if it's truthy, otherwise use the inner template
		state.template.push(
			b.if(
				id,
				b.block(build_template([id])),
				b.block([...inner_state.init, ...build_template(inner_state.template)])
			)
		);
	}

	if (!is_void(node.name)) {
		state.template.push(b.literal(`</${node.name}>`));
	}

	if (dev) {
		state.template.push(b.stmt(b.call('$.pop_element')));
	}
}

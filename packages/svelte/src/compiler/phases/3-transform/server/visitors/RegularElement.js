/** @import { Location } from 'locate-character' */
/** @import { RegularElement, Text } from '#compiler' */
/** @import { ComponentContext, ComponentServerTransformState } from '../types.js' */
/** @import { Scope } from '../../../scope.js' */
import { dev, locator } from '../../../../state.js';
import * as b from '../../../../utils/builders.js';
import { VoidElements } from '../../../constants.js';
import { clean_nodes, determine_namespace_for_children } from '../../utils.js';
import { serialize_element_attributes } from './shared/element.js';
import { process_children, serialize_template } from './shared/utils.js';

/**
 * @param {RegularElement} node
 * @param {ComponentContext} context
 */
export function RegularElement(node, context) {
	const namespace = determine_namespace_for_children(node, context.state.namespace);

	/** @type {ComponentServerTransformState} */
	const state = {
		...context.state,
		namespace,
		preserve_whitespace:
			context.state.preserve_whitespace ||
			((node.name === 'pre' || node.name === 'textarea') && namespace !== 'foreign')
	};

	context.state.template.push(b.literal(`<${node.name}`));
	const body = serialize_element_attributes(node, { ...context, state });
	context.state.template.push(b.literal('>'));

	if ((node.name === 'script' || node.name === 'style') && node.fragment.nodes.length === 1) {
		context.state.template.push(
			b.literal(/** @type {Text} */ (node.fragment.nodes[0]).data),
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
				b.block(serialize_template([id])),
				b.block([...inner_state.init, ...serialize_template(inner_state.template)])
			)
		);
	}

	if (!VoidElements.includes(node.name) || namespace === 'foreign') {
		state.template.push(b.literal(`</${node.name}>`));
	}

	if (dev) {
		state.template.push(b.stmt(b.call('$.pop_element')));
	}
}

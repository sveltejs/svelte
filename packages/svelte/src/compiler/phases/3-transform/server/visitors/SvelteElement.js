/** @import { BlockStatement, Expression } from 'estree' */
/** @import { SvelteElement } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '../../../../utils/builders.js';
import { determine_namespace_for_children } from '../../utils.js';
import { serialize_element_attributes } from './shared/element.js';
import { serialize_template } from './shared/utils.js';

/**
 * @param {SvelteElement} node
 * @param {ComponentContext} context
 */
export function SvelteElement(node, context) {
	let tag = /** @type {Expression} */ (context.visit(node.tag));
	if (tag.type !== 'Identifier') {
		const tag_id = context.state.scope.generate('$$tag');
		context.state.init.push(b.const(tag_id, tag));
		tag = b.id(tag_id);
	}

	if (context.state.options.dev) {
		if (node.fragment.nodes.length > 0) {
			context.state.init.push(b.stmt(b.call('$.validate_void_dynamic_element', b.thunk(tag))));
		}
		context.state.init.push(b.stmt(b.call('$.validate_dynamic_element_tag', b.thunk(tag))));
	}

	const state = {
		...context.state,
		namespace: determine_namespace_for_children(node, context.state.namespace),
		template: [],
		init: []
	};

	serialize_element_attributes(node, { ...context, state });

	if (context.state.options.dev) {
		context.state.template.push(b.stmt(b.call('$.push_element', tag, b.id('$$payload'))));
	}

	const attributes = b.block([...state.init, ...serialize_template(state.template)]);
	const children = /** @type {BlockStatement} */ (context.visit(node.fragment, state));

	context.state.template.push(
		b.stmt(
			b.call(
				'$.element',
				b.id('$$payload'),
				tag,
				attributes.body.length > 0 && b.thunk(attributes),
				children.body.length > 0 && b.thunk(children)
			)
		)
	);

	if (context.state.options.dev) {
		context.state.template.push(b.stmt(b.call('$.pop_element')));
	}
}

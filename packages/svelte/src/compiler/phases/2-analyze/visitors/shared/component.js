/** @import { Component, SvelteComponent, SvelteSelf } from '#compiler' */
/** @import { Context } from '../../types' */
import * as e from '../../../../errors.js';
import {
	get_attribute_expression,
	is_expression_attribute,
	is_text_attribute
} from '../../../../utils/ast.js';
import { is_element_node } from '../../../nodes.js';
import {
	validate_attribute,
	validate_attribute_name,
	validate_slot_attribute
} from './attribute.js';

/**
 * @param {Component | SvelteComponent | SvelteSelf} node
 * @param {Context} context
 */
export function visit_component(node, context) {
	for (const attribute of node.attributes) {
		if (
			attribute.type !== 'Attribute' &&
			attribute.type !== 'SpreadAttribute' &&
			attribute.type !== 'LetDirective' &&
			attribute.type !== 'OnDirective' &&
			attribute.type !== 'BindDirective'
		) {
			e.component_invalid_directive(attribute);
		}

		if (
			attribute.type === 'OnDirective' &&
			(attribute.modifiers.length > 1 || attribute.modifiers.some((m) => m !== 'once'))
		) {
			e.event_handler_invalid_component_modifier(attribute);
		}

		if (attribute.type === 'Attribute') {
			if (context.state.analysis.runes) {
				validate_attribute(attribute, node);

				if (is_expression_attribute(attribute)) {
					const expression = get_attribute_expression(attribute);
					if (expression.type === 'SequenceExpression') {
						let i = /** @type {number} */ (expression.start);
						while (--i > 0) {
							const char = context.state.analysis.source[i];
							if (char === '(') break; // parenthesized sequence expressions are ok
							if (char === '{') e.attribute_invalid_sequence_expression(expression);
						}
					}
				}
			}

			validate_attribute_name(attribute);

			if (attribute.name === 'slot') {
				validate_slot_attribute(context, attribute, true);
			}
		}

		if (attribute.type === 'BindDirective' && attribute.name !== 'this') {
			context.state.analysis.uses_component_bindings = true;
		}
	}

	const component_slots = new Set();

	const default_state = {
		...context.state,
		scope: node.metadata.default_scope,
		parent_element: null,
		component_slots
	};

	const named_state = {
		...context.state,
		parent_element: null,
		component_slots
	};

	for (const attribute of node.attributes) {
		context.visit(attribute, attribute.type === 'LetDirective' ? default_state : named_state);
	}

	const default_slot_nodes = [];
	const named_slot_nodes = [];

	for (const child of node.fragment.nodes) {
		const is_slotted_content =
			is_element_node(child) &&
			child.attributes.some(
				(a) => a.type === 'Attribute' && a.name === 'slot' && is_text_attribute(a)
			);

		if (child.type === 'Comment') {
			// ensure svelte-ignore comments are preserved in both cases
			// TODO this is brittle
			named_slot_nodes.push(child);
			default_slot_nodes.push(child);
		} else if (is_slotted_content) {
			named_slot_nodes.push(child);
		} else {
			default_slot_nodes.push(child);
		}
	}

	context.visit({ ...node.fragment, nodes: default_slot_nodes }, default_state);
	context.visit({ ...node.fragment, nodes: named_slot_nodes }, named_state);

	// context.visit(child, is_slotted_content ? named_state : default_state);

	// if (
	// 	is_element_node(child) &&
	// 	child.attributes.some(
	// 		(a) => a.type === 'Attribute' && a.name === 'slot' && is_text_attribute(a)
	// 	)
	// ) {
	// 	context.visit(child);
	// } else {
	// 	context.visit(child, { scope });
	// }

	// context.visit(node, attribute.type === 'LetDirective' ? default_state : named_state);
	// }

	// context.next({
	// 	...context.state,
	// 	parent_element: null,
	// 	component_slots: new Set()
	// });
}

/** @import { Component, Fragment, SvelteComponent, SvelteSelf } from '#compiler' */
/** @import { Context } from '../../types' */
import * as e from '../../../../errors.js';
import { get_attribute_expression, is_expression_attribute } from '../../../../utils/ast.js';
import { determine_slot } from '../../../../utils/slot.js';
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

	const slot_scope_applies_to_itself = !!determine_slot(node);

	const default_state = slot_scope_applies_to_itself
		? context.state
		: {
				...context.state,
				scope: node.metadata.scopes.default,
				parent_element: null,
				component_slots
			};

	for (const attribute of node.attributes) {
		context.visit(attribute, attribute.type === 'LetDirective' ? default_state : context.state);
	}

	const comments = [];

	/** @type {Record<string, Fragment['nodes']>} */
	const nodes = {
		default: []
	};

	for (const child of node.fragment.nodes) {
		if (child.type === 'Comment') {
			comments.push(child);
			continue;
		}

		let slot_name = determine_slot(child) ?? 'default';

		(nodes[slot_name] ??= []).push(...comments, child);
	}

	for (const slot_name in nodes) {
		context.visit(
			{ ...node.fragment, nodes: nodes[slot_name] },
			{
				...context.state,
				scope: node.metadata.scopes[slot_name],
				parent_element: null,
				component_slots
			}
		);
	}

	// context.visit({ ...node.fragment, nodes: default_slot_nodes }, default_state);
	// context.visit({ ...node.fragment, nodes: named_slot_nodes }, named_state);

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

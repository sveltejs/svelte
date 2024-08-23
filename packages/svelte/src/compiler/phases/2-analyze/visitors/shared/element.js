/** @import { Component, RegularElement, SvelteComponent, SvelteElement, SvelteSelf, TransitionDirective } from '#compiler' */
/** @import { Context } from '../../types' */
import { get_attribute_expression, is_expression_attribute } from '../../../../utils/ast.js';
import { regex_illegal_attribute_character } from '../../../patterns.js';
import * as e from '../../../../errors.js';
import * as w from '../../../../warnings.js';
import {
	validate_attribute,
	validate_attribute_name,
	validate_slot_attribute
} from './attribute.js';

const EVENT_MODIFIERS = [
	'preventDefault',
	'stopPropagation',
	'stopImmediatePropagation',
	'capture',
	'once',
	'passive',
	'nonpassive',
	'self',
	'trusted'
];

/**
 * @param {import('#compiler').RegularElement | SvelteElement} node
 * @param {Context} context
 */
export function validate_element(node, context) {
	let has_animate_directive = false;

	/** @type {TransitionDirective | null} */
	let in_transition = null;

	/** @type {TransitionDirective | null} */
	let out_transition = null;

	for (const attribute of node.attributes) {
		if (attribute.type === 'Attribute') {
			const is_expression = is_expression_attribute(attribute);

			if (context.state.analysis.runes) {
				validate_attribute(attribute, node);

				if (is_expression) {
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

			if (regex_illegal_attribute_character.test(attribute.name)) {
				e.attribute_invalid_name(attribute, attribute.name);
			}

			if (attribute.name.startsWith('on') && attribute.name.length > 2) {
				if (!is_expression) {
					e.attribute_invalid_event_handler(attribute);
				}

				const value = get_attribute_expression(attribute);
				if (
					value.type === 'Identifier' &&
					value.name === attribute.name &&
					!context.state.scope.get(value.name)
				) {
					w.attribute_global_event_reference(attribute, attribute.name);
				}
			}

			if (attribute.name === 'slot') {
				/** @type {RegularElement | SvelteElement | Component | SvelteComponent | SvelteSelf | undefined} */
				validate_slot_attribute(context, attribute);
			}

			if (attribute.name === 'is') {
				w.attribute_avoid_is(attribute);
			}

			const correct_name = react_attributes.get(attribute.name);
			if (correct_name) {
				w.attribute_invalid_property_name(attribute, attribute.name, correct_name);
			}

			validate_attribute_name(attribute);
		} else if (attribute.type === 'AnimateDirective') {
			const parent = context.path.at(-2);
			if (parent?.type !== 'EachBlock') {
				e.animation_invalid_placement(attribute);
			} else if (!parent.key) {
				e.animation_missing_key(attribute);
			} else if (
				parent.body.nodes.filter(
					(n) =>
						n.type !== 'Comment' &&
						n.type !== 'ConstTag' &&
						(n.type !== 'Text' || n.data.trim() !== '')
				).length > 1
			) {
				e.animation_invalid_placement(attribute);
			}

			if (has_animate_directive) {
				e.animation_duplicate(attribute);
			} else {
				has_animate_directive = true;
			}
		} else if (attribute.type === 'TransitionDirective') {
			const existing = /** @type {TransitionDirective | null} */ (
				(attribute.intro && in_transition) || (attribute.outro && out_transition)
			);

			if (existing) {
				const a = existing.intro ? (existing.outro ? 'transition' : 'in') : 'out';
				const b = attribute.intro ? (attribute.outro ? 'transition' : 'in') : 'out';

				if (a === b) {
					e.transition_duplicate(attribute, a);
				} else {
					e.transition_conflict(attribute, a, b);
				}
			}

			if (attribute.intro) in_transition = attribute;
			if (attribute.outro) out_transition = attribute;
		} else if (attribute.type === 'OnDirective') {
			let has_passive_modifier = false;
			let conflicting_passive_modifier = '';
			for (const modifier of attribute.modifiers) {
				if (!EVENT_MODIFIERS.includes(modifier)) {
					const list = `${EVENT_MODIFIERS.slice(0, -1).join(', ')} or ${EVENT_MODIFIERS.at(-1)}`;
					e.event_handler_invalid_modifier(attribute, list);
				}
				if (modifier === 'passive') {
					has_passive_modifier = true;
				} else if (modifier === 'nonpassive' || modifier === 'preventDefault') {
					conflicting_passive_modifier = modifier;
				}
				if (has_passive_modifier && conflicting_passive_modifier) {
					e.event_handler_invalid_modifier_combination(
						attribute,
						'passive',
						conflicting_passive_modifier
					);
				}
			}
		}
	}
}

const react_attributes = new Map([
	['className', 'class'],
	['htmlFor', 'for']
]);

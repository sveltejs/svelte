/** @import { AST } from '#compiler' */
/** @import { Context } from '../../types' */
import * as e from '../../../../errors.js';
import { is_text_attribute } from '../../../../utils/ast.js';
import * as w from '../../../../warnings.js';
import { is_custom_element_node } from '../../../nodes.js';
import { regex_only_whitespaces } from '../../../patterns.js';

/**
 * @param {AST.Attribute} attribute
 */
export function validate_attribute_name(attribute) {
	if (
		attribute.name.includes(':') &&
		!attribute.name.startsWith('xmlns:') &&
		!attribute.name.startsWith('xlink:') &&
		!attribute.name.startsWith('xml:')
	) {
		w.attribute_illegal_colon(attribute);
	}
}

/**
 * @param {AST.Attribute} attribute
 * @param {AST.ElementLike} parent
 */
export function validate_attribute(attribute, parent) {
	if (
		Array.isArray(attribute.value) &&
		attribute.value.length === 1 &&
		attribute.value[0].type === 'ExpressionTag' &&
		(parent.type === 'Component' ||
			parent.type === 'SvelteComponent' ||
			parent.type === 'SvelteSelf' ||
			(parent.type === 'RegularElement' && is_custom_element_node(parent)))
	) {
		w.attribute_quoted(attribute);
	}

	if (attribute.value === true || !Array.isArray(attribute.value) || attribute.value.length === 1) {
		return;
	}

	const is_quoted = attribute.value.at(-1)?.end !== attribute.end;

	if (!is_quoted) {
		e.attribute_unquoted_sequence(attribute);
	}
}

/**
 * @param {Context} context
 * @param {AST.Attribute} attribute
 * @param {boolean} is_component
 */
export function validate_slot_attribute(context, attribute, is_component = false) {
	const parent = context.path.at(-2);
	let owner = undefined;

	if (parent?.type === 'SnippetBlock') {
		if (!is_text_attribute(attribute)) {
			e.slot_attribute_invalid(attribute);
		}
		return;
	}

	let i = context.path.length;
	while (i--) {
		const ancestor = context.path[i];
		if (
			!owner &&
			(ancestor.type === 'Component' ||
				ancestor.type === 'SvelteComponent' ||
				ancestor.type === 'SvelteSelf' ||
				ancestor.type === 'SvelteElement' ||
				(ancestor.type === 'RegularElement' && is_custom_element_node(ancestor)))
		) {
			owner = ancestor;
		}
	}

	if (owner) {
		if (
			owner.type === 'Component' ||
			owner.type === 'SvelteComponent' ||
			owner.type === 'SvelteSelf'
		) {
			if (owner !== parent) {
				if (!is_component) {
					e.slot_attribute_invalid_placement(attribute);
				}
			} else {
				if (!is_text_attribute(attribute)) {
					e.slot_attribute_invalid(attribute);
				}

				const name = attribute.value[0].data;

				if (context.state.component_slots.has(name)) {
					e.slot_attribute_duplicate(attribute, name, owner.name);
				}

				context.state.component_slots.add(name);

				if (name === 'default') {
					for (const node of owner.fragment.nodes) {
						if (node.type === 'Text' && regex_only_whitespaces.test(node.data)) {
							continue;
						}

						if (node.type === 'RegularElement' || node.type === 'SvelteFragment') {
							if (node.attributes.some((a) => a.type === 'Attribute' && a.name === 'slot')) {
								continue;
							}
						}

						e.slot_default_duplicate(node);
					}
				}
			}
		}
	} else if (!is_component) {
		e.slot_attribute_invalid_placement(attribute);
	}
}

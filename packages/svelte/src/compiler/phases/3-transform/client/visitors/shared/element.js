/** @import { Expression, Identifier } from 'estree' */
/** @import { Attribute, ClassDirective, ExpressionMetadata, Namespace, RegularElement, StyleDirective, SvelteElement } from '#compiler' */
/** @import { ComponentContext } from '../../types' */
import { normalize_attribute } from '../../../../../../utils.js';
import * as b from '../../../../../utils/builders.js';
import { build_getter } from '../../utils.js';
import { build_template_literal, build_update } from './utils.js';

/**
 * Serializes each style directive into something like `$.set_style(element, style_property, value)`
 * and adds it either to init or update, depending on whether or not the value or the attributes are dynamic.
 * @param {StyleDirective[]} style_directives
 * @param {Identifier} element_id
 * @param {ComponentContext} context
 * @param {boolean} is_attributes_reactive
 * @param {boolean} force_check Should be `true` if we can't rely on our cached value, because for example there's also a `style` attribute
 */
export function build_style_directives(
	style_directives,
	element_id,
	context,
	is_attributes_reactive,
	force_check
) {
	const state = context.state;

	for (const directive of style_directives) {
		let value =
			directive.value === true
				? build_getter({ name: directive.name, type: 'Identifier' }, context.state)
				: build_attribute_value(directive.value, context).value;

		const update = b.stmt(
			b.call(
				'$.set_style',
				element_id,
				b.literal(directive.name),
				value,
				/** @type {Expression} */ (directive.modifiers.includes('important') ? b.true : undefined),
				force_check ? b.true : undefined
			)
		);

		const { has_state, has_call } = directive.metadata.expression;

		if (!is_attributes_reactive && has_call) {
			state.init.push(build_update(update));
		} else if (is_attributes_reactive || has_state || has_call) {
			state.update.push(update);
		} else {
			state.init.push(update);
		}
	}
}

/**
 * Serializes each class directive into something like `$.class_toogle(element, class_name, value)`
 * and adds it either to init or update, depending on whether or not the value or the attributes are dynamic.
 * @param {ClassDirective[]} class_directives
 * @param {Identifier} element_id
 * @param {ComponentContext} context
 * @param {boolean} is_attributes_reactive
 */
export function build_class_directives(
	class_directives,
	element_id,
	context,
	is_attributes_reactive
) {
	const state = context.state;
	for (const directive of class_directives) {
		const value = /** @type {Expression} */ (context.visit(directive.expression));
		const update = b.stmt(b.call('$.toggle_class', element_id, b.literal(directive.name), value));

		const { has_state, has_call } = directive.metadata.expression;

		if (!is_attributes_reactive && has_call) {
			state.init.push(build_update(update));
		} else if (is_attributes_reactive || has_state || has_call) {
			state.update.push(update);
		} else {
			state.init.push(update);
		}
	}
}

/**
 * @param {Attribute['value']} value
 * @param {ComponentContext} context
 */
export function build_attribute_value(value, context) {
	if (value === true) {
		return { has_state: false, has_call: false, value: b.literal(true) };
	}

	if (!Array.isArray(value) || value.length === 1) {
		const chunk = Array.isArray(value) ? value[0] : value;

		if (chunk.type === 'Text') {
			return { has_state: false, has_call: false, value: b.literal(chunk.data) };
		}

		return {
			has_state: chunk.metadata.expression.has_call,
			has_call: chunk.metadata.expression.has_call,
			value: /** @type {Expression} */ (context.visit(chunk.expression))
		};
	}

	return build_template_literal(value, context.visit, context.state);
}

/**
 * @param {RegularElement | SvelteElement} element
 * @param {Attribute} attribute
 * @param {{ state: { metadata: { namespace: Namespace }}}} context
 */
export function get_attribute_name(element, attribute, context) {
	if (
		!element.metadata.svg &&
		!element.metadata.mathml &&
		context.state.metadata.namespace !== 'foreign'
	) {
		return normalize_attribute(attribute.name);
	}

	return attribute.name;
}

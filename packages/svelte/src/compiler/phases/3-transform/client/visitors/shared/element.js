/** @import { Expression, Identifier, ObjectExpression } from 'estree' */
/** @import { AST, Namespace } from '#compiler' */
/** @import { ComponentClientTransformState, ComponentContext } from '../../types' */
import { normalize_attribute } from '../../../../../../utils.js';
import { is_ignored } from '../../../../../state.js';
import { get_attribute_expression, is_event_attribute } from '../../../../../utils/ast.js';
import * as b from '../../../../../utils/builders.js';
import { build_getter, create_derived } from '../../utils.js';
import { build_template_chunk, build_update } from './utils.js';

/**
 * @param {Array<AST.Attribute | AST.SpreadAttribute>} attributes
 * @param {ComponentContext} context
 * @param {AST.RegularElement | AST.SvelteElement} element
 * @param {Identifier} element_id
 * @param {Identifier} attributes_id
 * @param {false | Expression} preserve_attribute_case
 * @param {false | Expression} is_custom_element
 * @param {ComponentClientTransformState} state
 */
export function build_set_attributes(
	attributes,
	context,
	element,
	element_id,
	attributes_id,
	preserve_attribute_case,
	is_custom_element,
	state
) {
	let has_state = false;

	/** @type {ObjectExpression['properties']} */
	const values = [];

	for (const attribute of attributes) {
		if (attribute.type === 'Attribute') {
			const { value } = build_attribute_value(attribute.value, context);

			if (
				is_event_attribute(attribute) &&
				(value.type === 'ArrowFunctionExpression' || value.type === 'FunctionExpression')
			) {
				// Give the event handler a stable ID so it isn't removed and readded on every update
				const id = context.state.scope.generate('event_handler');
				context.state.init.push(b.var(id, value));
				values.push(b.init(attribute.name, b.id(id)));
			} else {
				values.push(b.init(attribute.name, value));
			}

			has_state ||= attribute.metadata.expression.has_state;
		} else {
			// objects could contain reactive getters -> play it safe and always assume spread attributes are reactive
			has_state = true;

			let value = /** @type {Expression} */ (context.visit(attribute));

			if (attribute.metadata.expression.has_call) {
				const id = b.id(state.scope.generate('spread_with_call'));
				state.init.push(b.const(id, create_derived(state, b.thunk(value))));
				value = b.call('$.get', id);
			}
			values.push(b.spread(value));
		}
	}

	const call = b.call(
		'$.set_attributes',
		element_id,
		has_state ? attributes_id : b.literal(null),
		b.object(values),
		context.state.analysis.css.hash !== '' && b.literal(context.state.analysis.css.hash),
		preserve_attribute_case,
		is_custom_element,
		is_ignored(element, 'hydration_attribute_changed') && b.true
	);

	if (has_state) {
		context.state.init.push(b.let(attributes_id));
		const update = b.stmt(b.assignment('=', attributes_id, call));
		context.state.update.push(update);
		return true;
	}

	context.state.init.push(b.stmt(call));
	return false;
}

/**
 * Serializes each style directive into something like `$.set_style(element, style_property, value)`
 * and adds it either to init or update, depending on whether or not the value or the attributes are dynamic.
 * @param {AST.StyleDirective[]} style_directives
 * @param {Identifier} element_id
 * @param {ComponentContext} context
 * @param {boolean} is_attributes_reactive
 */
export function build_style_directives(
	style_directives,
	element_id,
	context,
	is_attributes_reactive
) {
	const state = context.state;

	for (const directive of style_directives) {
		const { has_state, has_call } = directive.metadata.expression;

		let value =
			directive.value === true
				? build_getter({ name: directive.name, type: 'Identifier' }, context.state)
				: build_attribute_value(directive.value, context).value;

		if (has_call) {
			const id = b.id(state.scope.generate('style_directive'));

			state.init.push(b.const(id, create_derived(state, b.thunk(value))));
			value = b.call('$.get', id);
		}

		const update = b.stmt(
			b.call(
				'$.set_style',
				element_id,
				b.literal(directive.name),
				value,
				/** @type {Expression} */ (directive.modifiers.includes('important') ? b.true : undefined)
			)
		);

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
 * @param {AST.ClassDirective[]} class_directives
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
		const { has_state, has_call } = directive.metadata.expression;
		let value = /** @type {Expression} */ (context.visit(directive.expression));

		if (has_call) {
			const id = b.id(state.scope.generate('class_directive'));

			state.init.push(b.const(id, create_derived(state, b.thunk(value))));
			value = b.call('$.get', id);
		}

		const update = b.stmt(b.call('$.toggle_class', element_id, b.literal(directive.name), value));

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
 * @param {AST.Attribute['value']} value
 * @param {ComponentContext} context
 * @returns {{ value: Expression, has_state: boolean, has_call: boolean }}
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
			has_state: chunk.metadata.expression.has_state,
			has_call: chunk.metadata.expression.has_call,
			value: /** @type {Expression} */ (context.visit(chunk.expression))
		};
	}

	return build_template_chunk(value, context.visit, context.state);
}

/**
 * @param {AST.RegularElement | AST.SvelteElement} element
 * @param {AST.Attribute} attribute
 */
export function get_attribute_name(element, attribute) {
	if (!element.metadata.svg && !element.metadata.mathml) {
		return normalize_attribute(attribute.name);
	}

	return attribute.name;
}

/** @import { Expression, Literal, ObjectExpression } from 'estree' */
/** @import { AST, Namespace } from '#compiler' */
/** @import { ComponentContext, ComponentServerTransformState } from '../../types.js' */
import {
	get_attribute_chunks,
	is_event_attribute,
	is_text_attribute
} from '../../../../../utils/ast.js';
import { binding_properties } from '../../../../bindings.js';
import {
	create_attribute,
	create_expression_metadata,
	is_custom_element_node
} from '../../../../nodes.js';
import { regex_starts_with_newline } from '../../../../patterns.js';
import * as b from '../../../../../utils/builders.js';
import {
	ELEMENT_IS_NAMESPACED,
	ELEMENT_PRESERVE_ATTRIBUTE_CASE
} from '../../../../../../constants.js';
import { build_attribute_value } from './utils.js';
import {
	is_boolean_attribute,
	is_content_editable_binding,
	is_load_error_element
} from '../../../../../../utils.js';
import { escape_html } from '../../../../../../escaping.js';

const WHITESPACE_INSENSITIVE_ATTRIBUTES = ['class', 'style'];

/**
 * Writes the output to the template output. Some elements may have attributes on them that require the
 * their output to be the child content instead. In this case, an object is returned.
 * @param {AST.RegularElement | AST.SvelteElement} node
 * @param {import('zimmerframe').Context<AST.SvelteNode, ComponentServerTransformState>} context
 */
export function build_element_attributes(node, context) {
	/** @type {Array<AST.Attribute | AST.SpreadAttribute>} */
	const attributes = [];

	/** @type {AST.ClassDirective[]} */
	const class_directives = [];

	/** @type {AST.StyleDirective[]} */
	const style_directives = [];

	/** @type {Expression | null} */
	let content = null;

	let has_spread = false;
	// Use the index to keep the attributes order which is important for spreading
	let class_index = -1;
	let style_index = -1;
	let events_to_capture = new Set();

	for (const attribute of node.attributes) {
		if (attribute.type === 'Attribute') {
			if (attribute.name === 'value') {
				if (node.name === 'textarea') {
					if (
						attribute.value !== true &&
						Array.isArray(attribute.value) &&
						attribute.value[0].type === 'Text' &&
						regex_starts_with_newline.test(attribute.value[0].data)
					) {
						// Two or more leading newlines are required to restore the leading newline immediately after `<textarea>`.
						// see https://html.spec.whatwg.org/multipage/syntax.html#element-restrictions
						// also see related code in analysis phase
						attribute.value[0].data = '\n' + attribute.value[0].data;
					}
					content = b.call('$.escape', build_attribute_value(attribute.value, context));
				} else if (node.name !== 'select') {
					// omit value attribute for select elements, it's irrelevant for the initially selected value and has no
					// effect on the selected value after the user interacts with the select element (the value _property_ does, but not the attribute)
					attributes.push(attribute);
				}

				// omit event handlers except for special cases
			} else if (is_event_attribute(attribute)) {
				if (
					(attribute.name === 'onload' || attribute.name === 'onerror') &&
					is_load_error_element(node.name)
				) {
					events_to_capture.add(attribute.name);
				}
				// the defaultValue/defaultChecked properties don't exist as attributes
			} else if (attribute.name !== 'defaultValue' && attribute.name !== 'defaultChecked') {
				if (attribute.name === 'class') {
					class_index = attributes.length;
					if (attribute.metadata.needs_clsx) {
						attributes.push({
							...attribute,
							value: {
								.../** @type {AST.ExpressionTag} */ (attribute.value),
								expression: b.call(
									'$.clsx',
									/** @type {AST.ExpressionTag} */ (attribute.value).expression
								)
							}
						});
					} else {
						attributes.push(attribute);
					}
				} else {
					if (attribute.name === 'style') {
						style_index = attributes.length;
					}

					attributes.push(attribute);
				}
			}
		} else if (attribute.type === 'BindDirective') {
			if (attribute.name === 'value' && node.name === 'select') continue;
			if (
				attribute.name === 'value' &&
				attributes.some(
					(attr) =>
						attr.type === 'Attribute' &&
						attr.name === 'type' &&
						is_text_attribute(attr) &&
						attr.value[0].data === 'file'
				)
			) {
				continue;
			}
			if (attribute.name === 'this') continue;

			const binding = binding_properties[attribute.name];
			if (binding?.omit_in_ssr) continue;

			let expression = /** @type {Expression} */ (context.visit(attribute.expression));

			if (expression.type === 'SequenceExpression') {
				expression = b.call(expression.expressions[0]);
			}

			if (is_content_editable_binding(attribute.name)) {
				content = expression;
			} else if (attribute.name === 'value' && node.name === 'textarea') {
				content = b.call('$.escape', expression);
			} else if (attribute.name === 'group' && attribute.expression.type !== 'SequenceExpression') {
				const value_attribute = /** @type {AST.Attribute | undefined} */ (
					node.attributes.find((attr) => attr.type === 'Attribute' && attr.name === 'value')
				);
				if (!value_attribute) continue;

				const is_checkbox = node.attributes.some(
					(attr) =>
						attr.type === 'Attribute' &&
						attr.name === 'type' &&
						is_text_attribute(attr) &&
						attr.value[0].data === 'checkbox'
				);

				attributes.push(
					create_attribute('checked', -1, -1, [
						{
							type: 'ExpressionTag',
							start: -1,
							end: -1,
							expression: is_checkbox
								? b.call(
										b.member(attribute.expression, 'includes'),
										build_attribute_value(value_attribute.value, context)
									)
								: b.binary(
										'===',
										attribute.expression,
										build_attribute_value(value_attribute.value, context)
									),
							metadata: {
								expression: create_expression_metadata()
							}
						}
					])
				);
			} else {
				attributes.push(
					create_attribute(attribute.name, -1, -1, [
						{
							type: 'ExpressionTag',
							start: -1,
							end: -1,
							expression,
							metadata: {
								expression: create_expression_metadata()
							}
						}
					])
				);
			}
		} else if (attribute.type === 'SpreadAttribute') {
			attributes.push(attribute);
			has_spread = true;
			if (is_load_error_element(node.name)) {
				events_to_capture.add('onload');
				events_to_capture.add('onerror');
			}
		} else if (attribute.type === 'UseDirective') {
			if (is_load_error_element(node.name)) {
				events_to_capture.add('onload');
				events_to_capture.add('onerror');
			}
		} else if (attribute.type === 'ClassDirective') {
			class_directives.push(attribute);
		} else if (attribute.type === 'StyleDirective') {
			style_directives.push(attribute);
		} else if (attribute.type === 'LetDirective') {
			// do nothing, these are handled inside `build_inline_component`
		} else {
			context.visit(attribute);
		}
	}

	if ((node.metadata.scoped || class_directives.length) && !has_spread) {
		const class_attribute = build_to_class(
			node.metadata.scoped ? context.state.analysis.css.hash : null,
			class_directives,
			/** @type {AST.Attribute | null} */ (attributes[class_index] ?? null)
		);
		if (class_index === -1) {
			attributes.push(class_attribute);
		}
	}

	if (style_directives.length > 0 && !has_spread) {
		build_style_directives(
			style_directives,
			/** @type {AST.Attribute | null} */ (attributes[style_index] ?? null),
			context
		);
		if (style_index > -1) {
			attributes.splice(style_index, 1);
		}
	}

	if (has_spread) {
		build_element_spread_attributes(node, attributes, style_directives, class_directives, context);
	} else {
		for (const attribute of /** @type {AST.Attribute[]} */ (attributes)) {
			if (attribute.value === true || is_text_attribute(attribute)) {
				const name = get_attribute_name(node, attribute);
				const literal_value = /** @type {Literal} */ (
					build_attribute_value(
						attribute.value,
						context,
						WHITESPACE_INSENSITIVE_ATTRIBUTES.includes(name)
					)
				).value;
				if (name !== 'class' || literal_value) {
					context.state.template.push(
						b.literal(
							` ${attribute.name}${
								is_boolean_attribute(name) && literal_value === true
									? ''
									: `="${literal_value === true ? '' : String(literal_value)}"`
							}`
						)
					);
				}
				continue;
			}

			const name = get_attribute_name(node, attribute);
			const value = build_attribute_value(
				attribute.value,
				context,
				WHITESPACE_INSENSITIVE_ATTRIBUTES.includes(name)
			);

			// pre-escape and inline literal attributes :
			if (value.type === 'Literal' && typeof value.value === 'string') {
				context.state.template.push(b.literal(` ${name}="${escape_html(value.value, true)}"`));
			} else {
				context.state.template.push(
					b.call('$.attr', b.literal(name), value, is_boolean_attribute(name) && b.true)
				);
			}
		}
	}

	if (events_to_capture.size !== 0) {
		for (const event of events_to_capture) {
			context.state.template.push(b.literal(` ${event}="this.__e=event"`));
		}
	}

	return content;
}

/**
 * @param {AST.RegularElement | AST.SvelteElement} element
 * @param {AST.Attribute} attribute
 */
function get_attribute_name(element, attribute) {
	let name = attribute.name;
	if (!element.metadata.svg && !element.metadata.mathml) {
		name = name.toLowerCase();
		// don't lookup boolean aliases here, the server runtime function does only
		// check for the lowercase variants of boolean attributes
	}
	return name;
}

/**
 *
 * @param {AST.RegularElement | AST.SvelteElement} element
 * @param {Array<AST.Attribute | AST.SpreadAttribute>} attributes
 * @param {AST.StyleDirective[]} style_directives
 * @param {AST.ClassDirective[]} class_directives
 * @param {ComponentContext} context
 */
function build_element_spread_attributes(
	element,
	attributes,
	style_directives,
	class_directives,
	context
) {
	let classes;
	let styles;
	let flags = 0;

	if (class_directives.length) {
		const properties = class_directives.map((directive) =>
			b.init(
				directive.name,
				directive.expression.type === 'Identifier' && directive.expression.name === directive.name
					? b.id(directive.name)
					: /** @type {Expression} */ (context.visit(directive.expression))
			)
		);
		classes = b.object(properties);
	}

	if (style_directives.length > 0) {
		const properties = style_directives.map((directive) =>
			b.init(
				directive.name,
				directive.value === true
					? b.id(directive.name)
					: build_attribute_value(directive.value, context, true)
			)
		);

		styles = b.object(properties);
	}

	if (element.metadata.svg || element.metadata.mathml) {
		flags |= ELEMENT_IS_NAMESPACED | ELEMENT_PRESERVE_ATTRIBUTE_CASE;
	} else if (is_custom_element_node(element)) {
		flags |= ELEMENT_PRESERVE_ATTRIBUTE_CASE;
	}

	const object = b.object(
		attributes.map((attribute) => {
			if (attribute.type === 'Attribute') {
				const name = get_attribute_name(element, attribute);
				const value = build_attribute_value(
					attribute.value,
					context,
					WHITESPACE_INSENSITIVE_ATTRIBUTES.includes(name)
				);
				return b.prop('init', b.key(name), value);
			}

			return b.spread(/** @type {Expression} */ (context.visit(attribute)));
		})
	);

	const css_hash = context.state.analysis.css.hash
		? b.literal(context.state.analysis.css.hash)
		: b.null;

	const args = [object, css_hash, classes, styles, flags ? b.literal(flags) : undefined];
	context.state.template.push(b.call('$.spread_attributes', ...args));
}

/**
 *
 * @param {string | null} hash
 * @param {AST.ClassDirective[]} class_directives
 * @param {AST.Attribute | null} class_attribute
 * @returns
 */
function build_to_class(hash, class_directives, class_attribute) {
	if (class_attribute === null) {
		class_attribute = create_attribute('class', -1, -1, []);
	}

	/** @type {ObjectExpression | undefined} */
	let classes;

	if (class_directives.length) {
		classes = b.object(
			class_directives.map((directive) =>
				b.prop('init', b.literal(directive.name), directive.expression)
			)
		);
	}

	/** @type {Expression} */
	let class_name;

	if (class_attribute.value === true) {
		class_name = b.literal('');
	} else if (Array.isArray(class_attribute.value)) {
		if (class_attribute.value.length === 0) {
			class_name = b.null;
		} else {
			class_name = class_attribute.value
				.map((val) => (val.type === 'Text' ? b.literal(val.data) : val.expression))
				.reduce((left, right) => b.binary('+', left, right));
		}
	} else {
		class_name = class_attribute.value.expression;
	}

	/** @type {Expression} */
	let expression;

	if (
		hash &&
		!classes &&
		class_name.type === 'Literal' &&
		(class_name.value === null || class_name.value === '' || typeof class_name.value === 'string')
	) {
		if (class_name.value === null || class_name.value === '') {
			expression = b.literal(hash);
		} else {
			expression = b.literal(escape_html(class_name.value, true) + ' ' + hash);
		}
	} else {
		expression = b.call('$.to_class', class_name, b.literal(hash), classes);
	}

	class_attribute.value = {
		type: 'ExpressionTag',
		start: -1,
		end: -1,
		expression: expression,
		metadata: {
			expression: create_expression_metadata()
		}
	};

	return class_attribute;
}

/**
 * @param {AST.StyleDirective[]} style_directives
 * @param {AST.Attribute | null} style_attribute
 * @param {ComponentContext} context
 */
function build_style_directives(style_directives, style_attribute, context) {
	const styles = style_directives.map((directive) => {
		let value =
			directive.value === true
				? b.id(directive.name)
				: build_attribute_value(directive.value, context, true);
		if (directive.modifiers.includes('important')) {
			value = b.binary('+', value, b.literal(' !important'));
		}
		return b.init(directive.name, value);
	});

	const arg =
		style_attribute === null
			? b.object(styles)
			: b.call(
					'$.merge_styles',
					build_attribute_value(style_attribute.value, context, true),
					b.object(styles)
				);

	context.state.template.push(b.call('$.add_styles', arg));
}

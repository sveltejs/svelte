/** @import { ArrayExpression, Expression, Literal, ObjectExpression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext, ComponentServerTransformState } from '../../types.js' */
import { is_event_attribute, is_text_attribute } from '../../../../../utils/ast.js';
import { binding_properties } from '../../../../bindings.js';
import {
	create_attribute,
	create_expression_metadata,
	is_custom_element_node
} from '../../../../nodes.js';
import { regex_starts_with_newline } from '../../../../patterns.js';
import * as b from '#compiler/builders';
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

	if (has_spread) {
		build_element_spread_attributes(node, attributes, style_directives, class_directives, context);
		if (node.name === 'option') {
			context.state.template.push(
				b.call(
					'$.maybe_selected',
					b.id('$$payload'),
					b.member(
						build_spread_object(
							node,
							node.attributes.filter(
								(attribute) =>
									attribute.type === 'Attribute' ||
									attribute.type === 'BindDirective' ||
									attribute.type === 'SpreadAttribute'
							),
							context
						),
						'value',
						false,
						true
					)
				)
			);
		}
	} else {
		const css_hash = node.metadata.scoped ? context.state.analysis.css.hash : null;

		for (const attribute of /** @type {AST.Attribute[]} */ (attributes)) {
			const name = get_attribute_name(node, attribute);
			const can_use_literal =
				(name !== 'class' || class_directives.length === 0) &&
				(name !== 'style' || style_directives.length === 0);

			if (can_use_literal && (attribute.value === true || is_text_attribute(attribute))) {
				let literal_value = /** @type {Literal} */ (
					build_attribute_value(
						attribute.value,
						context,
						WHITESPACE_INSENSITIVE_ATTRIBUTES.includes(name)
					)
				).value;

				if (name === 'class' && css_hash) {
					literal_value = (String(literal_value) + ' ' + css_hash).trim();
				}

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

				if (node.name === 'option' && name === 'value') {
					context.state.template.push(
						b.call(
							'$.maybe_selected',
							b.id('$$payload'),
							literal_value != null ? b.literal(/** @type {any} */ (literal_value)) : b.void0
						)
					);
				}

				continue;
			}

			const value = build_attribute_value(
				attribute.value,
				context,
				WHITESPACE_INSENSITIVE_ATTRIBUTES.includes(name)
			);

			// pre-escape and inline literal attributes :
			if (can_use_literal && value.type === 'Literal' && typeof value.value === 'string') {
				if (name === 'class' && css_hash) {
					value.value = (value.value + ' ' + css_hash).trim();
				}
				context.state.template.push(b.literal(` ${name}="${escape_html(value.value, true)}"`));
			} else if (name === 'class') {
				context.state.template.push(build_attr_class(class_directives, value, context, css_hash));
			} else if (name === 'style') {
				context.state.template.push(build_attr_style(style_directives, value, context));
			} else {
				context.state.template.push(
					b.call('$.attr', b.literal(name), value, is_boolean_attribute(name) && b.true)
				);
			}

			if (name === 'value' && node.name === 'option') {
				context.state.template.push(b.call('$.maybe_selected', b.id('$$payload'), value));
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
 * @param {AST.Attribute | AST.BindDirective} attribute
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
 * @param {AST.RegularElement | AST.SvelteElement} element
 * @param {Array<AST.Attribute | AST.SpreadAttribute | AST.BindDirective>} attributes
 * @param {ComponentContext} context
 */
export function build_spread_object(element, attributes, context) {
	return b.object(
		attributes.map((attribute) => {
			if (attribute.type === 'Attribute') {
				const name = get_attribute_name(element, attribute);
				const value = build_attribute_value(
					attribute.value,
					context,
					WHITESPACE_INSENSITIVE_ATTRIBUTES.includes(name)
				);
				return b.prop('init', b.key(name), value);
			} else if (attribute.type === 'BindDirective') {
				const name = get_attribute_name(element, attribute);
				const value =
					attribute.expression.type === 'SequenceExpression'
						? b.call(attribute.expression.expressions[0])
						: /** @type {Expression} */ (context.visit(attribute.expression));
				return b.prop('init', b.key(name), value);
			}

			return b.spread(/** @type {Expression} */ (context.visit(attribute)));
		})
	);
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

	const object = build_spread_object(element, attributes, context);

	const css_hash =
		element.metadata.scoped && context.state.analysis.css.hash
			? b.literal(context.state.analysis.css.hash)
			: b.null;

	const args = [object, css_hash, classes, styles, flags ? b.literal(flags) : undefined];
	context.state.template.push(b.call('$.spread_attributes', ...args));
}

/**
 *
 * @param {AST.ClassDirective[]} class_directives
 * @param {Expression} expression
 * @param {ComponentContext} context
 * @param {string | null} hash
 */
function build_attr_class(class_directives, expression, context, hash) {
	/** @type {ObjectExpression | undefined} */
	let directives;

	if (class_directives.length) {
		directives = b.object(
			class_directives.map((directive) =>
				b.prop(
					'init',
					b.literal(directive.name),
					/** @type {Expression} */ (context.visit(directive.expression, context.state))
				)
			)
		);
	}

	let css_hash;

	if (hash) {
		if (expression.type === 'Literal' && typeof expression.value === 'string') {
			expression.value = (expression.value + ' ' + hash).trim();
		} else {
			css_hash = b.literal(hash);
		}
	}

	return b.call('$.attr_class', expression, css_hash, directives);
}

/**
 *
 * @param {AST.StyleDirective[]} style_directives
 * @param {Expression} expression
 * @param {ComponentContext} context
 */
function build_attr_style(style_directives, expression, context) {
	/** @type {ArrayExpression | ObjectExpression | undefined} */
	let directives;

	if (style_directives.length) {
		let normal_properties = [];
		let important_properties = [];

		for (const directive of style_directives) {
			const expression =
				directive.value === true
					? b.id(directive.name)
					: build_attribute_value(directive.value, context, true);

			let name = directive.name;
			if (name[0] !== '-' || name[1] !== '-') {
				name = name.toLowerCase();
			}

			const property = b.init(directive.name, expression);
			if (directive.modifiers.includes('important')) {
				important_properties.push(property);
			} else {
				normal_properties.push(property);
			}
		}

		if (important_properties.length) {
			directives = b.array([b.object(normal_properties), b.object(important_properties)]);
		} else {
			directives = b.object(normal_properties);
		}
	}

	return b.call('$.attr_style', expression, directives);
}

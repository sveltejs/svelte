/** @import { Expression, ExpressionStatement, Literal } from 'estree' */
/** @import { Attribute, ClassDirective, Namespace, RegularElement, SpreadAttribute, StyleDirective, SvelteElement, SvelteNode } from '#compiler' */
/** @import { ComponentContext, ComponentServerTransformState } from '../../types.js' */
import {
	get_attribute_chunks,
	is_event_attribute,
	is_text_attribute
} from '../../../../../utils/ast.js';
import { binding_properties } from '../../../../bindings.js';
import {
	ContentEditableBindings,
	LoadErrorElements,
	WhitespaceInsensitiveAttributes
} from '../../../../constants.js';
import {
	create_attribute,
	create_expression_metadata,
	is_custom_element_node
} from '../../../../nodes.js';
import { regex_starts_with_newline } from '../../../../patterns.js';
import * as b from '../../../../../utils/builders.js';
import {
	DOMBooleanAttributes,
	ELEMENT_IS_NAMESPACED,
	ELEMENT_PRESERVE_ATTRIBUTE_CASE
} from '../../../../../../constants.js';
import { serialize_attribute_value } from './utils.js';

/**
 * Writes the output to the template output. Some elements may have attributes on them that require the
 * their output to be the child content instead. In this case, an object is returned.
 * @param {RegularElement | SvelteElement} node
 * @param {import('zimmerframe').Context<SvelteNode, ComponentServerTransformState>} context
 */
export function serialize_element_attributes(node, context) {
	/** @type {Array<Attribute | SpreadAttribute>} */
	const attributes = [];

	/** @type {ClassDirective[]} */
	const class_directives = [];

	/** @type {StyleDirective[]} */
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
					content = b.call('$.escape', serialize_attribute_value(attribute.value, context));
				} else if (node.name !== 'select') {
					// omit value attribute for select elements, it's irrelevant for the initially selected value and has no
					// effect on the selected value after the user interacts with the select element (the value _property_ does, but not the attribute)
					attributes.push(attribute);
				}

				// omit event handlers except for special cases
			} else if (is_event_attribute(attribute)) {
				if (
					(attribute.name === 'onload' || attribute.name === 'onerror') &&
					LoadErrorElements.includes(node.name)
				) {
					events_to_capture.add(attribute.name);
				}
			} else {
				if (attribute.name === 'class') {
					class_index = attributes.length;
				} else if (attribute.name === 'style') {
					style_index = attributes.length;
				}
				attributes.push(attribute);
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

			if (ContentEditableBindings.includes(attribute.name)) {
				content = /** @type {Expression} */ (context.visit(attribute.expression));
			} else if (attribute.name === 'value' && node.name === 'textarea') {
				content = b.call(
					'$.escape',
					/** @type {Expression} */ (context.visit(attribute.expression))
				);
			} else if (attribute.name === 'group') {
				const value_attribute = /** @type {Attribute | undefined} */ (
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
							parent: attribute,
							expression: is_checkbox
								? b.call(
										b.member(attribute.expression, b.id('includes')),
										serialize_attribute_value(value_attribute.value, context)
									)
								: b.binary(
										'===',
										attribute.expression,
										serialize_attribute_value(value_attribute.value, context)
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
							parent: attribute,
							expression: attribute.expression,
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
			if (LoadErrorElements.includes(node.name)) {
				events_to_capture.add('onload');
				events_to_capture.add('onerror');
			}
		} else if (attribute.type === 'UseDirective') {
			if (LoadErrorElements.includes(node.name)) {
				events_to_capture.add('onload');
				events_to_capture.add('onerror');
			}
		} else if (attribute.type === 'ClassDirective') {
			class_directives.push(attribute);
		} else if (attribute.type === 'StyleDirective') {
			style_directives.push(attribute);
		} else if (attribute.type === 'LetDirective') {
			// do nothing, these are handled inside `serialize_inline_component`
		} else {
			context.visit(attribute);
		}
	}

	if (class_directives.length > 0 && !has_spread) {
		const class_attribute = serialize_class_directives(
			class_directives,
			/** @type {Attribute | null} */ (attributes[class_index] ?? null)
		);
		if (class_index === -1) {
			attributes.push(class_attribute);
		}
	}

	if (style_directives.length > 0 && !has_spread) {
		serialize_style_directives(
			style_directives,
			/** @type {Attribute | null} */ (attributes[style_index] ?? null),
			context
		);
		if (style_index > -1) {
			attributes.splice(style_index, 1);
		}
	}

	if (has_spread) {
		serialize_element_spread_attributes(
			node,
			attributes,
			style_directives,
			class_directives,
			context
		);
	} else {
		for (const attribute of /** @type {Attribute[]} */ (attributes)) {
			if (attribute.value === true || is_text_attribute(attribute)) {
				const name = get_attribute_name(node, attribute, context);
				const literal_value = /** @type {Literal} */ (
					serialize_attribute_value(
						attribute.value,
						context,
						WhitespaceInsensitiveAttributes.includes(name)
					)
				).value;
				if (name !== 'class' || literal_value) {
					context.state.template.push(
						b.literal(
							` ${attribute.name}${
								DOMBooleanAttributes.includes(name) && literal_value === true
									? ''
									: `="${literal_value === true ? '' : String(literal_value)}"`
							}`
						)
					);
				}
				continue;
			}

			const name = get_attribute_name(node, attribute, context);
			const is_boolean = DOMBooleanAttributes.includes(name);
			const value = serialize_attribute_value(
				attribute.value,
				context,
				WhitespaceInsensitiveAttributes.includes(name)
			);

			context.state.template.push(
				b.call('$.attr', b.literal(name), value, is_boolean && b.literal(is_boolean))
			);
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
 * @param {RegularElement | SvelteElement} element
 * @param {Attribute} attribute
 * @param {{ state: { namespace: Namespace }}} context
 */
function get_attribute_name(element, attribute, context) {
	let name = attribute.name;
	if (!element.metadata.svg && !element.metadata.mathml && context.state.namespace !== 'foreign') {
		name = name.toLowerCase();
		// don't lookup boolean aliases here, the server runtime function does only
		// check for the lowercase variants of boolean attributes
	}
	return name;
}

/**
 *
 * @param {RegularElement | SvelteElement} element
 * @param {Array<Attribute | SpreadAttribute>} attributes
 * @param {StyleDirective[]} style_directives
 * @param {ClassDirective[]} class_directives
 * @param {ComponentContext} context
 */
function serialize_element_spread_attributes(
	element,
	attributes,
	style_directives,
	class_directives,
	context
) {
	let classes;
	let styles;
	let flags = 0;

	if (class_directives.length > 0 || context.state.analysis.css.hash) {
		const properties = class_directives.map((directive) =>
			b.init(
				directive.name,
				directive.expression.type === 'Identifier' && directive.expression.name === directive.name
					? b.id(directive.name)
					: /** @type {Expression} */ (context.visit(directive.expression))
			)
		);

		if (context.state.analysis.css.hash) {
			properties.unshift(b.init(context.state.analysis.css.hash, b.literal(true)));
		}

		classes = b.object(properties);
	}

	if (style_directives.length > 0) {
		const properties = style_directives.map((directive) =>
			b.init(
				directive.name,
				directive.value === true
					? b.id(directive.name)
					: serialize_attribute_value(directive.value, context, true)
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
				const name = get_attribute_name(element, attribute, context);
				const value = serialize_attribute_value(
					attribute.value,
					context,
					WhitespaceInsensitiveAttributes.includes(name)
				);
				return b.prop('init', b.key(name), value);
			}

			return b.spread(/** @type {Expression} */ (context.visit(attribute)));
		})
	);

	const args = [object, classes, styles, flags ? b.literal(flags) : undefined];
	context.state.template.push(b.call('$.spread_attributes', ...args));
}

/**
 *
 * @param {ClassDirective[]} class_directives
 * @param {Attribute | null} class_attribute
 * @returns
 */
function serialize_class_directives(class_directives, class_attribute) {
	const expressions = class_directives.map((directive) =>
		b.conditional(directive.expression, b.literal(directive.name), b.literal(''))
	);

	if (class_attribute === null) {
		class_attribute = create_attribute('class', -1, -1, []);
	}

	const chunks = get_attribute_chunks(class_attribute.value);
	const last = chunks.at(-1);

	if (last?.type === 'Text') {
		last.data += ' ';
		last.raw += ' ';
	} else if (last) {
		chunks.push({
			type: 'Text',
			start: -1,
			end: -1,
			parent: class_attribute,
			data: ' ',
			raw: ' '
		});
	}

	chunks.push({
		type: 'ExpressionTag',
		start: -1,
		end: -1,
		parent: class_attribute,
		expression: b.call(
			b.member(
				b.call(b.member(b.array(expressions), b.id('filter')), b.id('Boolean')),
				b.id('join')
			),
			b.literal(' ')
		),
		metadata: {
			expression: create_expression_metadata()
		}
	});

	class_attribute.value = chunks;
	return class_attribute;
}

/**
 * @param {StyleDirective[]} style_directives
 * @param {Attribute | null} style_attribute
 * @param {ComponentContext} context
 */
function serialize_style_directives(style_directives, style_attribute, context) {
	const styles = style_directives.map((directive) => {
		let value =
			directive.value === true
				? b.id(directive.name)
				: serialize_attribute_value(directive.value, context, true);
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
					serialize_attribute_value(style_attribute.value, context, true),
					b.object(styles)
				);

	context.state.template.push(b.call('$.add_styles', arg));
}

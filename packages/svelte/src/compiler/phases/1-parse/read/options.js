/** @import { ObjectExpression } from 'estree' */
/** @import { SvelteOptionsRaw, Root, SvelteOptions } from '#compiler' */
import { namespace_mathml, namespace_svg } from '../../../../constants.js';
import * as e from '../../../errors.js';

const regex_valid_tag_name = /^[a-zA-Z][a-zA-Z0-9]*-[a-zA-Z0-9-]+$/;

/**
 * @param {SvelteOptionsRaw} node
 * @returns {Root['options']}
 */
export default function read_options(node) {
	/** @type {SvelteOptions} */
	const component_options = {
		start: node.start,
		end: node.end,
		// @ts-ignore
		attributes: node.attributes
	};

	if (!node) {
		return component_options;
	}

	for (const attribute of node.attributes) {
		if (attribute.type !== 'Attribute') {
			e.svelte_options_invalid_attribute(attribute);
		}

		const { name } = attribute;

		switch (name) {
			case 'runes': {
				component_options.runes = get_boolean_value(attribute);
				break;
			}
			case 'tag': {
				e.svelte_options_deprecated_tag(attribute);
				break; // eslint doesn't know this is unnecessary
			}
			case 'customElement': {
				/** @type {SvelteOptions['customElement']} */
				const ce = { tag: '' };
				const { value: v } = attribute;
				const value = v === true || Array.isArray(v) ? v : [v];

				if (value === true) {
					e.svelte_options_invalid_customelement(attribute);
				} else if (value[0].type === 'Text') {
					const tag = get_static_value(attribute);
					validate_tag(attribute, tag);
					ce.tag = tag;
					component_options.customElement = ce;
					break;
				} else if (value[0].expression.type !== 'ObjectExpression') {
					// Before Svelte 4 it was necessary to explicitly set customElement to null or else you'd get a warning.
					// This is no longer necessary, but for backwards compat just skip in this case now.
					if (value[0].expression.type === 'Literal' && value[0].expression.value === null) {
						break;
					}
					e.svelte_options_invalid_customelement(attribute);
				}

				/** @type {Array<[string, any]>} */
				const properties = [];
				for (const property of value[0].expression.properties) {
					if (
						property.type !== 'Property' ||
						property.computed ||
						property.key.type !== 'Identifier'
					) {
						e.svelte_options_invalid_customelement(attribute);
					}
					properties.push([property.key.name, property.value]);
				}

				const tag = properties.find(([name]) => name === 'tag');
				if (tag) {
					const tag_value = tag[1]?.value;
					validate_tag(tag, tag_value);
					ce.tag = tag_value;
				} else {
					e.svelte_options_invalid_customelement(attribute);
				}

				const props = properties.find(([name]) => name === 'props')?.[1];
				if (props) {
					if (props.type !== 'ObjectExpression') {
						e.svelte_options_invalid_customelement_props(attribute);
					}
					ce.props = {};
					for (const property of /** @type {ObjectExpression} */ (props).properties) {
						if (
							property.type !== 'Property' ||
							property.computed ||
							property.key.type !== 'Identifier' ||
							property.value.type !== 'ObjectExpression'
						) {
							e.svelte_options_invalid_customelement_props(attribute);
						}
						ce.props[property.key.name] = {};
						for (const prop of property.value.properties) {
							if (
								prop.type !== 'Property' ||
								prop.computed ||
								prop.key.type !== 'Identifier' ||
								prop.value.type !== 'Literal'
							) {
								e.svelte_options_invalid_customelement_props(attribute);
							}

							if (prop.key.name === 'type') {
								if (
									['String', 'Number', 'Boolean', 'Array', 'Object'].indexOf(
										/** @type {string} */ (prop.value.value)
									) === -1
								) {
									e.svelte_options_invalid_customelement_props(attribute);
								}
								ce.props[property.key.name].type = /** @type {any} */ (prop.value.value);
							} else if (prop.key.name === 'reflect') {
								if (typeof prop.value.value !== 'boolean') {
									e.svelte_options_invalid_customelement_props(attribute);
								}
								ce.props[property.key.name].reflect = prop.value.value;
							} else if (prop.key.name === 'attribute') {
								if (typeof prop.value.value !== 'string') {
									e.svelte_options_invalid_customelement_props(attribute);
								}
								ce.props[property.key.name].attribute = prop.value.value;
							} else {
								e.svelte_options_invalid_customelement_props(attribute);
							}
						}
					}
				}

				const shadow = properties.find(([name]) => name === 'shadow')?.[1];
				if (shadow) {
					const shadowdom = shadow?.value;
					if (shadowdom !== 'open' && shadowdom !== 'none') {
						e.svelte_options_invalid_customelement_shadow(shadow);
					}
					ce.shadow = shadowdom;
				}

				const extend = properties.find(([name]) => name === 'extend')?.[1];
				if (extend) {
					ce.extend = extend;
				}

				component_options.customElement = ce;
				break;
			}
			case 'namespace': {
				const value = get_static_value(attribute);

				if (value === namespace_svg) {
					component_options.namespace = 'svg';
				} else if (value === namespace_mathml) {
					component_options.namespace = 'mathml';
				} else if (
					value === 'html' ||
					value === 'mathml' ||
					value === 'svg' ||
					value === 'foreign'
				) {
					component_options.namespace = value;
				} else {
					e.svelte_options_invalid_attribute_value(
						attribute,
						`"html", "mathml", "svg" or "foreign"`
					);
				}

				break;
			}
			case 'immutable': {
				component_options.immutable = get_boolean_value(attribute);
				break;
			}
			case 'preserveWhitespace': {
				component_options.preserveWhitespace = get_boolean_value(attribute);
				break;
			}
			case 'accessors': {
				component_options.accessors = get_boolean_value(attribute);
				break;
			}
			default:
				e.svelte_options_unknown_attribute(attribute, name);
		}
	}

	return component_options;
}

/**
 * @param {any} attribute
 */
function get_static_value(attribute) {
	const { value } = attribute;

	if (value === true) return true;

	const chunk = Array.isArray(value) ? value[0] : value;

	if (!chunk) return true;
	if (value.length > 1) {
		return null;
	}
	if (chunk.type === 'Text') return chunk.data;
	if (chunk.expression.type !== 'Literal') {
		return null;
	}

	return chunk.expression.value;
}

/**
 * @param {any} attribute
 */
function get_boolean_value(attribute) {
	const value = get_static_value(attribute);
	if (typeof value !== 'boolean') {
		e.svelte_options_invalid_attribute_value(attribute, 'true or false');
	}
	return value;
}

/**
 * @param {any} attribute
 * @param {string | null} tag
 * @returns {asserts tag is string}
 */
function validate_tag(attribute, tag) {
	if (typeof tag !== 'string') {
		e.svelte_options_invalid_tagname(attribute);
	}
	if (tag && !regex_valid_tag_name.test(tag)) {
		e.svelte_options_invalid_tagname(attribute);
	}
	// TODO do we still need this?
	// if (tag && !component.compile_options.customElement) {
	// 	component.warn(attribute, compiler_warnings.missing_custom_element_compile_options);
	// }
}

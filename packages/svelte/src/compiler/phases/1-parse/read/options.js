/** @import { ObjectExpression } from 'estree' */
/** @import { AST } from '#compiler' */
import { NAMESPACE_MATHML, NAMESPACE_SVG } from '../../../../constants.js';
import * as e from '../../../errors.js';

/**
 * @param {AST.SvelteOptionsRaw} node
 * @returns {AST.Root['options']}
 */
export default function read_options(node) {
	/** @type {AST.SvelteOptions} */
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
				/** @type {AST.SvelteOptions['customElement']} */
				const ce = {};
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
					if (shadow.type === 'Literal' && (shadow.value === 'open' || shadow.value === 'none')) {
						ce.shadow = shadow.value;
					} else if (shadow.type === 'ObjectExpression') {
						ce.shadow = shadow;
					} else {
						e.svelte_options_invalid_customelement_shadow(attribute);
					}
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

				if (value === NAMESPACE_SVG) {
					component_options.namespace = 'svg';
				} else if (value === NAMESPACE_MATHML) {
					component_options.namespace = 'mathml';
				} else if (value === 'html' || value === 'mathml' || value === 'svg') {
					component_options.namespace = value;
				} else {
					e.svelte_options_invalid_attribute_value(attribute, `"html", "mathml" or "svg"`);
				}

				break;
			}
			case 'css': {
				const value = get_static_value(attribute);

				if (value === 'injected') {
					component_options.css = value;
				} else {
					e.svelte_options_invalid_attribute_value(attribute, `"injected"`);
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

// https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
const tag_name_char =
	'[a-z0-9_.\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}-]';
const regex_valid_tag_name = new RegExp(`^[a-z]${tag_name_char}*-${tag_name_char}*$`, 'u');
const reserved_tag_names = [
	'annotation-xml',
	'color-profile',
	'font-face',
	'font-face-src',
	'font-face-uri',
	'font-face-format',
	'font-face-name',
	'missing-glyph'
];

/**
 * @param {any} attribute
 * @param {string | null} tag
 * @returns {asserts tag is string}
 */
function validate_tag(attribute, tag) {
	if (typeof tag !== 'string') {
		e.svelte_options_invalid_tagname(attribute);
	}
	if (tag) {
		if (!regex_valid_tag_name.test(tag)) {
			e.svelte_options_invalid_tagname(attribute);
		} else if (reserved_tag_names.includes(tag)) {
			e.svelte_options_reserved_tagname(attribute);
		}
	}
}

import { namespace_svg } from '../../../../constants.js';
import { error } from '../../../errors.js';

const regex_valid_tag_name = /^[a-zA-Z][a-zA-Z0-9]*-[a-zA-Z0-9-]+$/;

/**
 * @param {import('#compiler').SvelteOptionsRaw} node
 * @returns {import('#compiler').Root['options']}
 */
export default function read_options(node) {
	/** @type {import('#compiler').SvelteOptions} */
	const component_options = {
		start: node.start,
		end: node.end
	};

	if (!node) {
		return component_options;
	}

	for (const attribute of node.attributes) {
		if (attribute.type !== 'Attribute') {
			error(attribute, 'invalid-svelte-option-attribute');
		}

		const { name } = attribute;

		switch (name) {
			case 'runes': {
				const value = get_static_value(attribute, () =>
					error(attribute, 'invalid-svelte-option-runes')
				);
				if (typeof value !== 'boolean') {
					error(attribute, 'invalid-svelte-option-runes');
				}
				component_options.runes = value;
				break;
			}
			case 'tag': {
				error(attribute, 'tag-option-deprecated');
				break; // eslint doesn't know this is unnecessary
			}
			case 'customElement': {
				/** @type {import('#compiler').SvelteOptions['customElement']} */
				const ce = { tag: '' };

				const { value } = attribute;
				if (value === true) {
					error(attribute, 'invalid-svelte-option-customElement');
				} else if (value[0].type === 'Text') {
					const tag = get_static_value(attribute, () => error(attribute, 'invalid-tag-property'));
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
					error(attribute, 'invalid-svelte-option-customElement');
				}

				/** @type {Array<[string, any]>} */
				const properties = [];
				for (const property of value[0].expression.properties) {
					if (
						property.type !== 'Property' ||
						property.computed ||
						property.key.type !== 'Identifier'
					) {
						error(attribute, 'invalid-svelte-option-customElement');
					}
					properties.push([property.key.name, property.value]);
				}

				const tag = properties.find(([name]) => name === 'tag');
				if (tag) {
					const tag_value = tag[1]?.value;
					validate_tag(tag, tag_value);
					ce.tag = tag_value;
				} else {
					error(attribute, 'invalid-svelte-option-customElement');
				}

				const props = properties.find(([name]) => name === 'props')?.[1];
				if (props) {
					if (props.type !== 'ObjectExpression') {
						error(attribute, 'invalid-customElement-props-attribute');
					}
					ce.props = {};
					for (const property of /** @type {import('estree').ObjectExpression} */ (props)
						.properties) {
						if (
							property.type !== 'Property' ||
							property.computed ||
							property.key.type !== 'Identifier' ||
							property.value.type !== 'ObjectExpression'
						) {
							error(attribute, 'invalid-customElement-props-attribute');
						}
						ce.props[property.key.name] = {};
						for (const prop of property.value.properties) {
							if (
								prop.type !== 'Property' ||
								prop.computed ||
								prop.key.type !== 'Identifier' ||
								prop.value.type !== 'Literal'
							) {
								error(attribute, 'invalid-customElement-props-attribute');
							}

							if (prop.key.name === 'type') {
								if (
									['String', 'Number', 'Boolean', 'Array', 'Object'].indexOf(
										/** @type {string} */ (prop.value.value)
									) === -1
								) {
									error(attribute, 'invalid-customElement-props-attribute');
								}
								ce.props[property.key.name].type = /** @type {any} */ (prop.value.value);
							} else if (prop.key.name === 'reflect') {
								if (typeof prop.value.value !== 'boolean') {
									error(attribute, 'invalid-customElement-props-attribute');
								}
								ce.props[property.key.name].reflect = prop.value.value;
							} else if (prop.key.name === 'attribute') {
								if (typeof prop.value.value !== 'string') {
									error(attribute, 'invalid-customElement-props-attribute');
								}
								ce.props[property.key.name].attribute = prop.value.value;
							} else {
								error(attribute, 'invalid-customElement-props-attribute');
							}
						}
					}
				}

				const shadow = properties.find(([name]) => name === 'shadow')?.[1];
				if (shadow) {
					const shadowdom = shadow?.value;
					if (shadowdom !== 'open' && shadowdom !== 'none') {
						error(shadow, 'invalid-customElement-shadow-attribute');
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
				const value = get_static_value(attribute, () =>
					error(attribute, 'invalid-svelte-option-namespace')
				);
				if (typeof value !== 'string') {
					error(attribute, 'invalid-svelte-option-namespace');
				}

				if (value === namespace_svg) {
					component_options.namespace = 'svg';
				} else if (value === 'html' || value === 'svg' || value === 'foreign') {
					component_options.namespace = value;
				} else {
					error(attribute, 'invalid-svelte-option-namespace');
				}

				break;
			}
			case 'immutable': {
				const value = get_static_value(attribute, () =>
					error(attribute, 'invalid-svelte-option-immutable')
				);
				if (typeof value !== 'boolean') {
					error(attribute, 'invalid-svelte-option-immutable');
				}
				component_options.immutable = value;
				break;
			}
			case 'preserveWhitespace': {
				const value = get_static_value(attribute, () =>
					error(attribute, 'invalid-svelte-option-preserveWhitespace')
				);
				if (typeof value !== 'boolean') {
					error(attribute, 'invalid-svelte-option-preserveWhitespace');
				}
				component_options.preserveWhitespace = value;
				break;
			}
			case 'accessors': {
				const value = get_static_value(attribute, () =>
					error(attribute, 'invalid-svelte-option-accessors')
				);
				if (typeof value !== 'boolean') {
					error(attribute, 'invalid-svelte-option-accessors');
				}
				component_options.accessors = value;
				break;
			}
			default:
				error(attribute, 'unknown-svelte-option-attribute', name);
		}
	}

	return component_options;
}

/**
 * @param {any} attribute
 * @param {(attribute: any) => never} error
 */
function get_static_value(attribute, error) {
	const { value } = attribute;
	const chunk = value[0];
	if (!chunk) return true;
	if (value.length > 1) {
		error(attribute);
	}
	if (chunk.type === 'Text') return chunk.data;
	if (chunk.expression.type !== 'Literal') {
		error(attribute);
	}
	return chunk.expression.value;
}

/**
 * @param {any} attribute
 * @param {string} tag
 * @returns {asserts tag is string}
 */
function validate_tag(attribute, tag) {
	if (typeof tag !== 'string' && tag !== null) {
		error(attribute, 'invalid-tag-property');
	}
	if (tag && !regex_valid_tag_name.test(tag)) {
		error(attribute, 'invalid-tag-property');
	}
	// TODO do we still need this?
	// if (tag && !component.compile_options.customElement) {
	// 	component.warn(attribute, compiler_warnings.missing_custom_element_compile_options);
	// }
}

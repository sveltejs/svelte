/** @import { AST } from '#compiler' */
/** @import { Context } from '../../../types.js' */
/** @import { ARIARoleDefinitionKey, ARIARoleRelationConcept, ARIAProperty, ARIAPropertyDefinition, ARIARoleDefinition } from 'aria-query' */
import {
	a11y_distracting_elements,
	a11y_implicit_semantics,
	a11y_interactive_handlers,
	a11y_labelable,
	a11y_nested_implicit_semantics,
	a11y_non_interactive_element_to_interactive_role_exceptions,
	a11y_recommended_interactive_handlers,
	a11y_required_attributes,
	a11y_required_content,
	abstract_roles,
	address_type_tokens,
	aria_attributes,
	aria_roles,
	autofill_contact_field_name_tokens,
	autofill_field_name_tokens,
	combobox_if_list,
	contact_type_tokens,
	ElementInteractivity,
	input_type_to_implicit_role,
	interactive_element_ax_object_schemas,
	interactive_element_role_schemas,
	interactive_roles,
	invisible_elements,
	menuitem_type_to_implicit_role,
	non_interactive_element_ax_object_schemas,
	non_interactive_element_role_schemas,
	non_interactive_roles,
	presentation_roles
} from './constants.js';
import { roles as roles_map, aria } from 'aria-query';
// @ts-expect-error package doesn't provide typings
import { AXObjectRoles, elementAXObjects } from 'axobject-query';
import {
	regex_heading_tags,
	regex_js_prefix,
	regex_not_whitespace,
	regex_redundant_img_alt,
	regex_starts_with_vowel,
	regex_whitespaces
} from '../../../../patterns.js';
import { is_event_attribute, is_text_attribute } from '../../../../../utils/ast.js';
import { list } from '../../../../../utils/string.js';
import { walk } from 'zimmerframe';
import fuzzymatch from '../../../../1-parse/utils/fuzzymatch.js';
import { is_content_editable_binding } from '../../../../../../utils.js';
import * as w from '../../../../../warnings.js';

/**
 * @param {AST.RegularElement | AST.SvelteElement} node
 * @param {Context} context
 */
export function check_element(node, context) {
	/** @type {Map<string, AST.Attribute>} */
	const attribute_map = new Map();

	/** @type {Set<string>} */
	const handlers = new Set();

	/** @type {AST.Attribute[]} */
	const attributes = [];

	const is_dynamic_element = node.type === 'SvelteElement';

	let has_spread = false;
	let has_contenteditable_attr = false;
	let has_contenteditable_binding = false;

	for (const attribute of node.attributes) {
		switch (attribute.type) {
			case 'Attribute': {
				if (is_event_attribute(attribute)) {
					handlers.add(attribute.name.slice(2));
				} else {
					attributes.push(attribute);
					attribute_map.set(attribute.name, attribute);
					if (attribute.name === 'contenteditable') {
						has_contenteditable_attr = true;
					}
				}
				break;
			}
			case 'SpreadAttribute': {
				has_spread = true;
				break;
			}
			case 'BindDirective': {
				if (is_content_editable_binding(attribute.name)) {
					has_contenteditable_binding = true;
				}
				break;
			}
			case 'OnDirective': {
				handlers.add(attribute.name);
				break;
			}
		}
	}

	for (const attribute of node.attributes) {
		if (attribute.type !== 'Attribute') continue;

		const name = attribute.name.toLowerCase();
		// aria-props
		if (name.startsWith('aria-')) {
			if (invisible_elements.includes(node.name)) {
				// aria-unsupported-elements
				w.a11y_aria_attributes(attribute, node.name);
			}

			const type = name.slice(5);
			if (!aria_attributes.includes(type)) {
				const match = fuzzymatch(type, aria_attributes);
				w.a11y_unknown_aria_attribute(attribute, type, match);
			}

			if (name === 'aria-hidden' && regex_heading_tags.test(node.name)) {
				w.a11y_hidden(attribute, node.name);
			}

			// aria-proptypes
			let value = get_static_value(attribute);

			const schema = aria.get(/** @type {ARIAProperty} */ (name));
			if (schema !== undefined) {
				validate_aria_attribute_value(attribute, /** @type {ARIAProperty} */ (name), schema, value);
			}

			// aria-activedescendant-has-tabindex
			if (
				name === 'aria-activedescendant' &&
				!is_dynamic_element &&
				!is_interactive_element(node.name, attribute_map) &&
				!attribute_map.has('tabindex') &&
				!has_spread
			) {
				w.a11y_aria_activedescendant_has_tabindex(attribute);
			}
		}

		switch (name) {
			// aria-role
			case 'role': {
				if (invisible_elements.includes(node.name)) {
					// aria-unsupported-elements
					w.a11y_misplaced_role(attribute, node.name);
				}

				const value = get_static_value(attribute);
				if (typeof value !== 'string') {
					break;
				}
				for (const c_r of value.split(regex_whitespaces)) {
					const current_role = /** @type {ARIARoleDefinitionKey} current_role */ (c_r);

					if (current_role && is_abstract_role(current_role)) {
						w.a11y_no_abstract_role(attribute, current_role);
					} else if (current_role && !aria_roles.includes(current_role)) {
						const match = fuzzymatch(current_role, aria_roles);
						w.a11y_unknown_role(attribute, current_role, match);
					}

					// no-redundant-roles
					if (
						current_role === get_implicit_role(node.name, attribute_map) &&
						// <ul role="list"> is ok because CSS list-style:none removes the semantics and this is a way to bring them back
						!['ul', 'ol', 'li'].includes(node.name) &&
						// <a role="link" /> is ok because without href the a tag doesn't have a role of link
						!(node.name === 'a' && !attribute_map.has('href'))
					) {
						w.a11y_no_redundant_roles(attribute, current_role);
					}

					// Footers and headers are special cases, and should not have redundant roles unless they are the children of sections or articles.
					const is_parent_section_or_article = is_parent(context.path, ['section', 'article']);
					if (!is_parent_section_or_article) {
						const has_nested_redundant_role =
							current_role === a11y_nested_implicit_semantics.get(node.name);
						if (has_nested_redundant_role) {
							w.a11y_no_redundant_roles(attribute, current_role);
						}
					}

					// role-has-required-aria-props
					if (
						!is_dynamic_element &&
						!is_semantic_role_element(current_role, node.name, attribute_map)
					) {
						const role = roles_map.get(current_role);
						if (role) {
							const required_role_props = Object.keys(role.requiredProps);
							const has_missing_props =
								!has_spread &&
								required_role_props.some((prop) => !attributes.find((a) => a.name === prop));
							if (has_missing_props) {
								w.a11y_role_has_required_aria_props(
									attribute,
									current_role,
									list(
										required_role_props.map((v) => `"${v}"`),
										'and'
									)
								);
							}
						}
					}

					// interactive-supports-focus
					if (
						!has_spread &&
						!has_disabled_attribute(attribute_map) &&
						!is_hidden_from_screen_reader(node.name, attribute_map) &&
						!is_presentation_role(current_role) &&
						is_interactive_roles(current_role) &&
						is_static_element(node.name, attribute_map) &&
						!attribute_map.get('tabindex')
					) {
						const has_interactive_handlers = [...handlers].some((handler) =>
							a11y_interactive_handlers.includes(handler)
						);
						if (has_interactive_handlers) {
							w.a11y_interactive_supports_focus(node, current_role);
						}
					}

					// no-interactive-element-to-noninteractive-role
					if (
						!has_spread &&
						is_interactive_element(node.name, attribute_map) &&
						(is_non_interactive_roles(current_role) || is_presentation_role(current_role))
					) {
						w.a11y_no_interactive_element_to_noninteractive_role(node, node.name, current_role);
					}

					// no-noninteractive-element-to-interactive-role
					if (
						!has_spread &&
						is_non_interactive_element(node.name, attribute_map) &&
						is_interactive_roles(current_role) &&
						!a11y_non_interactive_element_to_interactive_role_exceptions[node.name]?.includes(
							current_role
						)
					) {
						w.a11y_no_noninteractive_element_to_interactive_role(node, node.name, current_role);
					}
				}
				break;
			}
			// no-access-key
			case 'accesskey': {
				w.a11y_accesskey(attribute);
				break;
			}
			// no-autofocus
			case 'autofocus': {
				if (node.name !== 'dialog' && !is_parent(context.path, ['dialog'])) {
					w.a11y_autofocus(attribute);
				}
				break;
			}
			// scope
			case 'scope': {
				if (!is_dynamic_element && node.name !== 'th') {
					w.a11y_misplaced_scope(attribute);
				}
				break;
			}
			// tabindex-no-positive
			case 'tabindex': {
				const value = get_static_value(attribute);
				// @ts-ignore todo is tabindex=true correct case?
				if (!isNaN(value) && +value > 0) {
					w.a11y_positive_tabindex(attribute);
				}
				break;
			}
		}
	}

	const role = attribute_map.get('role');
	const role_static_value = /** @type {ARIARoleDefinitionKey} */ (get_static_text_value(role));

	// click-events-have-key-events
	if (handlers.has('click')) {
		const is_non_presentation_role =
			role_static_value !== null && !is_presentation_role(role_static_value);
		if (
			!is_dynamic_element &&
			!is_hidden_from_screen_reader(node.name, attribute_map) &&
			(!role || is_non_presentation_role) &&
			!is_interactive_element(node.name, attribute_map) &&
			!has_spread
		) {
			const has_key_event =
				handlers.has('keydown') || handlers.has('keyup') || handlers.has('keypress');
			if (!has_key_event) {
				w.a11y_click_events_have_key_events(node);
			}
		}
	}

	const role_value = /** @type {ARIARoleDefinitionKey} */ (
		role ? role_static_value : get_implicit_role(node.name, attribute_map)
	);

	// no-noninteractive-tabindex
	if (
		!is_dynamic_element &&
		!is_interactive_element(node.name, attribute_map) &&
		!is_interactive_roles(role_static_value)
	) {
		const tab_index = attribute_map.get('tabindex');
		const tab_index_value = get_static_text_value(tab_index);
		if (tab_index && (tab_index_value === null || Number(tab_index_value) >= 0)) {
			w.a11y_no_noninteractive_tabindex(node);
		}
	}

	// role-supports-aria-props
	if (typeof role_value === 'string' && roles_map.has(role_value)) {
		const { props } = /** @type {ARIARoleDefinition} */ (roles_map.get(role_value));
		const invalid_aria_props = aria.keys().filter((attribute) => !(attribute in props));
		const is_implicit = role_value && role === undefined;
		for (const attr of attributes) {
			if (invalid_aria_props.includes(/** @type {ARIAProperty} */ (attr.name))) {
				if (is_implicit) {
					w.a11y_role_supports_aria_props_implicit(attr, attr.name, role_value, node.name);
				} else {
					w.a11y_role_supports_aria_props(attr, attr.name, role_value);
				}
			}
		}
	}

	// no-noninteractive-element-interactions
	if (
		!has_spread &&
		!has_contenteditable_attr &&
		!is_hidden_from_screen_reader(node.name, attribute_map) &&
		!is_presentation_role(role_static_value) &&
		((!is_interactive_element(node.name, attribute_map) &&
			is_non_interactive_roles(role_static_value)) ||
			(is_non_interactive_element(node.name, attribute_map) && !role))
	) {
		const has_interactive_handlers = [...handlers].some((handler) =>
			a11y_recommended_interactive_handlers.includes(handler)
		);
		if (has_interactive_handlers) {
			w.a11y_no_noninteractive_element_interactions(node, node.name);
		}
	}

	// no-static-element-interactions
	if (
		!has_spread &&
		(!role || role_static_value !== null) &&
		!is_hidden_from_screen_reader(node.name, attribute_map) &&
		!is_presentation_role(role_static_value) &&
		!is_interactive_element(node.name, attribute_map) &&
		!is_interactive_roles(role_static_value) &&
		!is_non_interactive_element(node.name, attribute_map) &&
		!is_non_interactive_roles(role_static_value) &&
		!is_abstract_role(role_static_value)
	) {
		const interactive_handlers = [...handlers].filter((handler) =>
			a11y_interactive_handlers.includes(handler)
		);
		if (interactive_handlers.length > 0) {
			w.a11y_no_static_element_interactions(node, node.name, list(interactive_handlers));
		}
	}

	if (!has_spread && handlers.has('mouseover') && !handlers.has('focus')) {
		w.a11y_mouse_events_have_key_events(node, 'mouseover', 'focus');
	}

	if (!has_spread && handlers.has('mouseout') && !handlers.has('blur')) {
		w.a11y_mouse_events_have_key_events(node, 'mouseout', 'blur');
	}

	// element-specific checks
	const is_labelled =
		attribute_map.has('aria-label') ||
		attribute_map.has('aria-labelledby') ||
		attribute_map.has('title');

	switch (node.name) {
		case 'a':
		case 'button': {
			const is_hidden =
				get_static_value(attribute_map.get('aria-hidden')) === 'true' ||
				get_static_value(attribute_map.get('inert')) !== null;

			if (!has_spread && !is_hidden && !is_labelled && !has_content(node)) {
				w.a11y_consider_explicit_label(node);
			}
			if (node.name === 'button') {
				break;
			}
			const href = attribute_map.get('href') || attribute_map.get('xlink:href');
			if (href) {
				const href_value = get_static_text_value(href);
				if (href_value !== null) {
					if (href_value === '' || href_value === '#' || regex_js_prefix.test(href_value)) {
						w.a11y_invalid_attribute(href, href_value, href.name);
					}
				}
			} else if (!has_spread) {
				const id_attribute = get_static_value(attribute_map.get('id'));
				const name_attribute = get_static_value(attribute_map.get('name'));
				const aria_disabled_attribute = get_static_value(attribute_map.get('aria-disabled'));
				if (!id_attribute && !name_attribute && aria_disabled_attribute !== 'true') {
					warn_missing_attribute(node, ['href']);
				}
			}
			break;
		}
		case 'input': {
			const type = attribute_map.get('type');
			const type_value = get_static_text_value(type);
			if (type_value === 'image' && !has_spread) {
				const required_attributes = ['alt', 'aria-label', 'aria-labelledby'];
				const has_attribute = required_attributes.some((name) => attribute_map.has(name));
				if (!has_attribute) {
					warn_missing_attribute(node, required_attributes, 'input type="image"');
				}
			}
			// autocomplete-valid
			const autocomplete = attribute_map.get('autocomplete');
			if (type && autocomplete) {
				const autocomplete_value = get_static_value(autocomplete);
				if (!is_valid_autocomplete(autocomplete_value)) {
					w.a11y_autocomplete_valid(
						autocomplete,
						/** @type {string} */ (autocomplete_value),
						type_value ?? '...'
					);
				}
			}
			break;
		}
		case 'img': {
			const alt_attribute = get_static_text_value(attribute_map.get('alt'));
			const aria_hidden = get_static_value(attribute_map.get('aria-hidden'));
			if (alt_attribute && !aria_hidden && !has_spread) {
				if (regex_redundant_img_alt.test(alt_attribute)) {
					w.a11y_img_redundant_alt(node);
				}
			}
			break;
		}
		case 'label': {
			/** @param {AST.TemplateNode} node */
			const has_input_child = (node) => {
				let has = false;
				walk(
					node,
					{},
					{
						_(node, { next }) {
							if (
								node.type === 'SvelteElement' ||
								node.type === 'SlotElement' ||
								node.type === 'Component' ||
								node.type === 'RenderTag' ||
								(node.type === 'RegularElement' &&
									(a11y_labelable.includes(node.name) || node.name === 'slot'))
							) {
								has = true;
							} else {
								next();
							}
						}
					}
				);
				return has;
			};
			if (!has_spread && !attribute_map.has('for') && !has_input_child(node)) {
				w.a11y_label_has_associated_control(node);
			}
			break;
		}
		case 'video': {
			const aria_hidden_attribute = attribute_map.get('aria-hidden');
			const aria_hidden_exist = aria_hidden_attribute && get_static_value(aria_hidden_attribute);
			if (attribute_map.has('muted') || aria_hidden_exist === 'true' || has_spread) {
				return;
			}
			let has_caption = false;
			const track = /** @type {AST.RegularElement | undefined} */ (
				node.fragment.nodes.find((i) => i.type === 'RegularElement' && i.name === 'track')
			);
			if (track) {
				has_caption = track.attributes.some(
					(a) =>
						a.type === 'SpreadAttribute' ||
						(a.type === 'Attribute' && a.name === 'kind' && get_static_value(a) === 'captions')
				);
			}
			if (!has_caption) {
				w.a11y_media_has_caption(node);
			}
			break;
		}
		case 'figcaption': {
			if (!is_parent(context.path, ['figure'])) {
				w.a11y_figcaption_parent(node);
			}
			break;
		}
		case 'figure': {
			const children = node.fragment.nodes.filter((node) => {
				if (node.type === 'Comment') return false;
				if (node.type === 'Text') return regex_not_whitespace.test(node.data);
				return true;
			});
			const index = children.findIndex(
				(child) => child.type === 'RegularElement' && child.name === 'figcaption'
			);
			if (index !== -1 && index !== 0 && index !== children.length - 1) {
				w.a11y_figcaption_index(children[index]);
			}
			break;
		}
	}

	if (!has_spread && node.name !== 'a') {
		const required_attributes = a11y_required_attributes[node.name];
		if (required_attributes) {
			const has_attribute = required_attributes.some((name) => attribute_map.has(name));
			if (!has_attribute) {
				warn_missing_attribute(node, required_attributes);
			}
		}
	}

	if (a11y_distracting_elements.includes(node.name)) {
		// no-distracting-elements
		w.a11y_distracting_elements(node, node.name);
	}

	// Check content
	if (
		!has_spread &&
		!is_labelled &&
		!has_contenteditable_binding &&
		a11y_required_content.includes(node.name) &&
		!has_content(node)
	) {
		w.a11y_missing_content(node, node.name);
	}
}

/**
 * @param {ARIARoleDefinitionKey} role
 */
function is_presentation_role(role) {
	return presentation_roles.includes(role);
}

/**
 * @param {string} tag_name
 * @param {Map<string, AST.Attribute>} attribute_map
 */
function is_hidden_from_screen_reader(tag_name, attribute_map) {
	if (tag_name === 'input') {
		const type = get_static_value(attribute_map.get('type'));
		if (type === 'hidden') {
			return true;
		}
	}

	const aria_hidden = attribute_map.get('aria-hidden');
	if (!aria_hidden) return false;
	const aria_hidden_value = get_static_value(aria_hidden);
	if (aria_hidden_value === null) return true;
	return aria_hidden_value === true || aria_hidden_value === 'true';
}

/**
 * @param {Map<string, AST.Attribute>} attribute_map
 */
function has_disabled_attribute(attribute_map) {
	const disabled_attr_value = get_static_value(attribute_map.get('disabled'));
	if (disabled_attr_value) {
		return true;
	}

	const aria_disabled_attr = attribute_map.get('aria-disabled');
	if (aria_disabled_attr) {
		const aria_disabled_attr_value = get_static_value(aria_disabled_attr);
		if (aria_disabled_attr_value === 'true') {
			return true;
		}
	}
	return false;
}

/**
 * @param {string} tag_name
 * @param {Map<string, AST.Attribute>} attribute_map
 * @returns {typeof ElementInteractivity[keyof typeof ElementInteractivity]}
 */
function element_interactivity(tag_name, attribute_map) {
	if (
		interactive_element_role_schemas.some((schema) => match_schema(schema, tag_name, attribute_map))
	) {
		return ElementInteractivity.Interactive;
	}
	if (
		tag_name !== 'header' &&
		non_interactive_element_role_schemas.some((schema) =>
			match_schema(schema, tag_name, attribute_map)
		)
	) {
		return ElementInteractivity.NonInteractive;
	}
	if (
		interactive_element_ax_object_schemas.some((schema) =>
			match_schema(schema, tag_name, attribute_map)
		)
	) {
		return ElementInteractivity.Interactive;
	}
	if (
		non_interactive_element_ax_object_schemas.some((schema) =>
			match_schema(schema, tag_name, attribute_map)
		)
	) {
		return ElementInteractivity.NonInteractive;
	}
	return ElementInteractivity.Static;
}

/**
 * @param {string} tag_name
 * @param {Map<string, AST.Attribute>} attribute_map
 * @returns {boolean}
 */
function is_interactive_element(tag_name, attribute_map) {
	return element_interactivity(tag_name, attribute_map) === ElementInteractivity.Interactive;
}

/**
 * @param {string} tag_name
 * @param {Map<string, AST.Attribute>} attribute_map
 * @returns {boolean}
 */
function is_non_interactive_element(tag_name, attribute_map) {
	return element_interactivity(tag_name, attribute_map) === ElementInteractivity.NonInteractive;
}

/**
 * @param {string} tag_name
 * @param {Map<string, AST.Attribute>} attribute_map
 * @returns {boolean}
 */
function is_static_element(tag_name, attribute_map) {
	return element_interactivity(tag_name, attribute_map) === ElementInteractivity.Static;
}

/**
 * @param {ARIARoleDefinitionKey} role
 * @param {string} tag_name
 * @param {Map<string, AST.Attribute>} attribute_map
 */
function is_semantic_role_element(role, tag_name, attribute_map) {
	for (const [schema, ax_object] of elementAXObjects.entries()) {
		if (
			schema.name === tag_name &&
			(!schema.attributes ||
				schema.attributes.every(
					/** @param {any} attr */
					(attr) =>
						attribute_map.has(attr.name) &&
						get_static_value(attribute_map.get(attr.name)) === attr.value
				))
		) {
			for (const name of ax_object) {
				const roles = AXObjectRoles.get(name);
				if (roles) {
					for (const { name } of roles) {
						if (name === role) {
							return true;
						}
					}
				}
			}
		}
	}
	return false;
}

/**
 * @param {null | true | string} autocomplete
 */
function is_valid_autocomplete(autocomplete) {
	if (autocomplete === true) {
		return false;
	} else if (!autocomplete) {
		return true; // dynamic value
	}
	const tokens = autocomplete.trim().toLowerCase().split(regex_whitespaces);
	if (typeof tokens[0] === 'string' && tokens[0].startsWith('section-')) {
		tokens.shift();
	}
	if (address_type_tokens.includes(tokens[0])) {
		tokens.shift();
	}
	if (autofill_field_name_tokens.includes(tokens[0])) {
		tokens.shift();
	} else {
		if (contact_type_tokens.includes(tokens[0])) {
			tokens.shift();
		}
		if (autofill_contact_field_name_tokens.includes(tokens[0])) {
			tokens.shift();
		} else {
			return false;
		}
	}
	if (tokens[0] === 'webauthn') {
		tokens.shift();
	}
	return tokens.length === 0;
}

/** @param {Map<string, AST.Attribute>} attribute_map */
function input_implicit_role(attribute_map) {
	const type_attribute = attribute_map.get('type');
	if (!type_attribute) return;
	const type = get_static_text_value(type_attribute);
	if (!type) return;
	const list_attribute_exists = attribute_map.has('list');
	if (list_attribute_exists && combobox_if_list.includes(type)) {
		return 'combobox';
	}
	return input_type_to_implicit_role.get(type);
}

/** @param {Map<string, AST.Attribute>} attribute_map */
function menuitem_implicit_role(attribute_map) {
	const type_attribute = attribute_map.get('type');
	if (!type_attribute) return;
	const type = get_static_text_value(type_attribute);
	if (!type) return;
	return menuitem_type_to_implicit_role.get(type);
}

/**
 * @param {string} name
 * @param {Map<string, AST.Attribute>} attribute_map
 */
function get_implicit_role(name, attribute_map) {
	if (name === 'menuitem') {
		return menuitem_implicit_role(attribute_map);
	} else if (name === 'input') {
		return input_implicit_role(attribute_map);
	} else {
		return a11y_implicit_semantics.get(name);
	}
}

/**
 * @param {ARIARoleDefinitionKey} role
 */
function is_non_interactive_roles(role) {
	return non_interactive_roles.includes(role);
}

/**
 * @param {ARIARoleDefinitionKey} role
 */
function is_interactive_roles(role) {
	return interactive_roles.includes(role);
}

/**
 * @param {ARIARoleDefinitionKey} role
 */
function is_abstract_role(role) {
	return abstract_roles.includes(role);
}

/**
 * @param {AST.Attribute | undefined} attribute
 */
function get_static_text_value(attribute) {
	const value = get_static_value(attribute);
	if (value === true) return null;
	return value;
}

/**
 * @param {AST.Attribute | undefined} attribute
 */
function get_static_value(attribute) {
	if (!attribute) return null;
	if (attribute.value === true) return true;
	if (is_text_attribute(attribute)) return attribute.value[0].data;
	return null;
}

/**
 * @param {AST.RegularElement | AST.SvelteElement} element
 */
function has_content(element) {
	for (const node of element.fragment.nodes) {
		if (node.type === 'Text') {
			if (node.data.trim() === '') {
				continue;
			}
		}

		if (node.type === 'RegularElement' || node.type === 'SvelteElement') {
			if (
				node.name === 'img' &&
				node.attributes.some((node) => node.type === 'Attribute' && node.name === 'alt')
			) {
				return true;
			}

			if (!has_content(node)) {
				continue;
			}
		}

		// assume everything else has content — this will result in false positives
		// (e.g. an empty `{#if ...}{/if}`) but that's probably fine
		return true;
	}
}

/**
 * @param {ARIARoleRelationConcept} schema
 * @param {string} tag_name
 * @param {Map<string, AST.Attribute>} attribute_map
 */
function match_schema(schema, tag_name, attribute_map) {
	if (schema.name !== tag_name) return false;
	if (!schema.attributes) return true;
	return schema.attributes.every((schema_attribute) => {
		const attribute = attribute_map.get(schema_attribute.name);
		if (!attribute) return false;
		if (schema_attribute.value && schema_attribute.value !== get_static_text_value(attribute)) {
			return false;
		}
		return true;
	});
}

/**
 * @param {AST.SvelteNode[]} path
 * @param {string[]} elements
 */
function is_parent(path, elements) {
	let i = path.length;
	while (i--) {
		const parent = path[i];
		if (parent.type === 'SvelteElement') return true; // unknown, play it safe, so we don't warn
		if (parent.type === 'RegularElement') {
			return elements.includes(parent.name);
		}
	}
	return false;
}

/**
 * @param {AST.Attribute} attribute
 * @param {ARIAProperty} name
 * @param {ARIAPropertyDefinition} schema
 * @param {string | true | null} value
 */
function validate_aria_attribute_value(attribute, name, schema, value) {
	const type = schema.type;

	if (value === null) return;
	if (value === true) value = '';

	switch (type) {
		case 'id':
		case 'string': {
			if (value === '') {
				w.a11y_incorrect_aria_attribute_type(attribute, name, 'non-empty string');
			}
			break;
		}
		case 'number': {
			if (value === '' || isNaN(+value)) {
				w.a11y_incorrect_aria_attribute_type(attribute, name, 'number');
			}
			break;
		}
		case 'boolean': {
			if (value !== 'true' && value !== 'false') {
				w.a11y_incorrect_aria_attribute_type_boolean(attribute, name);
			}
			break;
		}
		case 'idlist': {
			if (value === '') {
				w.a11y_incorrect_aria_attribute_type_idlist(attribute, name);
			}
			break;
		}
		case 'integer': {
			if (value === '' || !Number.isInteger(+value)) {
				w.a11y_incorrect_aria_attribute_type_integer(attribute, name);
			}
			break;
		}
		case 'token': {
			const values = (schema.values ?? []).map((value) => value.toString());
			if (!values.includes(value.toLowerCase())) {
				w.a11y_incorrect_aria_attribute_type_token(
					attribute,
					name,
					list(values.map((v) => `"${v}"`))
				);
			}
			break;
		}
		case 'tokenlist': {
			const values = (schema.values ?? []).map((value) => value.toString());
			if (
				value
					.toLowerCase()
					.split(regex_whitespaces)
					.some((value) => !values.includes(value))
			) {
				w.a11y_incorrect_aria_attribute_type_tokenlist(
					attribute,
					name,
					list(values.map((v) => `"${v}"`))
				);
			}
			break;
		}
		case 'tristate': {
			if (value !== 'true' && value !== 'false' && value !== 'mixed') {
				w.a11y_incorrect_aria_attribute_type_tristate(attribute, name);
			}
			break;
		}
	}
}

/**
 * @param {AST.RegularElement |AST.SvelteElement} node
 * @param {string[]} attributes
 * @param {string} name
 */
function warn_missing_attribute(node, attributes, name = node.name) {
	const article =
		regex_starts_with_vowel.test(attributes[0]) || attributes[0] === 'href' ? 'an' : 'a';
	const sequence =
		attributes.length > 1
			? attributes.slice(0, -1).join(', ') + ` or ${attributes[attributes.length - 1]}`
			: attributes[0];

	w.a11y_missing_attribute(node, name, article, sequence);
}

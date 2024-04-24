import { roles as roles_map, aria, elementRoles } from 'aria-query';
// @ts-expect-error package doesn't provide typings
import { AXObjects, AXObjectRoles, elementAXObjects } from 'axobject-query';
import {
	regex_heading_tags,
	regex_not_whitespace,
	regex_starts_with_vowel,
	regex_whitespaces
} from '../patterns.js';
import * as w from '../../warnings.js';
import fuzzymatch from '../1-parse/utils/fuzzymatch.js';
import { is_event_attribute, is_text_attribute } from '../../utils/ast.js';
import { ContentEditableBindings } from '../constants.js';
import { walk } from 'zimmerframe';
import { list } from '../../utils/string.js';

const aria_roles = roles_map.keys();
const abstract_roles = aria_roles.filter((role) => roles_map.get(role)?.abstract);
const non_abstract_roles = aria_roles.filter((name) => !abstract_roles.includes(name));
const non_interactive_roles = non_abstract_roles
	.filter((name) => {
		const role = roles_map.get(name);
		return (
			// 'toolbar' does not descend from widget, but it does support
			// aria-activedescendant, thus in practice we treat it as a widget.
			// focusable tabpanel elements are recommended if any panels in a set contain content where the first element in the panel is not focusable.
			// 'generic' is meant to have no semantic meaning.
			// 'cell' is treated as CellRole by the AXObject which is interactive, so we treat 'cell' it as interactive as well.
			!['toolbar', 'tabpanel', 'generic', 'cell'].includes(name) &&
			!role?.superClass.some((classes) => classes.includes('widget'))
		);
	})
	.concat(
		// The `progressbar` is descended from `widget`, but in practice, its
		// value is always `readonly`, so we treat it as a non-interactive role.
		'progressbar'
	);
const interactive_roles = non_abstract_roles.filter(
	(name) =>
		!non_interactive_roles.includes(name) &&
		// 'generic' is meant to have no semantic meaning.
		name !== 'generic'
);

/**
 * @param {import('aria-query').ARIARoleDefinitionKey} role
 */
function is_non_interactive_roles(role) {
	return non_interactive_roles.includes(role);
}

/**
 * @param {import('aria-query').ARIARoleDefinitionKey} role
 */
function is_interactive_roles(role) {
	return interactive_roles.includes(role);
}

/**
 * @param {import('aria-query').ARIARoleDefinitionKey} role
 */
function is_abstract_role(role) {
	return abstract_roles.includes(role);
}

const presentation_roles = ['presentation', 'none'];

/**
 * @param {import('aria-query').ARIARoleDefinitionKey} role
 */
function is_presentation_role(role) {
	return presentation_roles.includes(role);
}

/**
 * @param {string} tag_name
 * @param {Map<string, import('#compiler').Attribute>} attribute_map
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
 * @param {Map<string, import('#compiler').Attribute>} attribute_map
 */
function has_disabled_attribute(attribute_map) {
	const disabled_attr_value = get_static_value(attribute_map.get('disabled'));
	if (disabled_attr_value) {
		return true;
	}

	const aria_disabled_attr = attribute_map.get('aria-disabled');
	if (aria_disabled_attr) {
		const aria_disabled_attr_value = get_static_value(aria_disabled_attr);
		if (aria_disabled_attr_value === true) {
			return true;
		}
	}
	return false;
}

/**
 * @type {import('aria-query').ARIARoleRelationConcept[]}
 */
const non_interactive_element_role_schemas = [];
elementRoles.entries().forEach(([schema, roles]) => {
	if ([...roles].every((role) => role !== 'generic' && non_interactive_roles.includes(role))) {
		non_interactive_element_role_schemas.push(schema);
	}
});

/**
 * @type {import('aria-query').ARIARoleRelationConcept[]}
 */
const interactive_element_role_schemas = [];
elementRoles.entries().forEach(([schema, roles]) => {
	if ([...roles].every((role) => interactive_roles.includes(role))) {
		interactive_element_role_schemas.push(schema);
	}
});
const interactive_ax_objects = [...AXObjects.keys()].filter(
	(name) => AXObjects.get(name).type === 'widget'
);
const non_interactive_ax_objects = [...AXObjects.keys()].filter((name) =>
	['windows', 'structure'].includes(AXObjects.get(name).type)
);

/**
 * @type {import('aria-query').ARIARoleRelationConcept[]}
 */
const interactive_element_ax_object_schemas = [];
elementAXObjects.entries().forEach(
	/**
	 * @param {any} _
	 */
	([schema, ax_object]) => {
		if ([...ax_object].every((role) => interactive_ax_objects.includes(role))) {
			interactive_element_ax_object_schemas.push(schema);
		}
	}
);

/**
 * @type {import('aria-query').ARIARoleRelationConcept[]}
 */
const non_interactive_element_ax_object_schemas = [];
elementAXObjects.entries().forEach(
	/**
	 * @param {any} _
	 */
	([schema, ax_object]) => {
		if ([...ax_object].every((role) => non_interactive_ax_objects.includes(role))) {
			non_interactive_element_ax_object_schemas.push(schema);
		}
	}
);

/**
 * @param {import('aria-query').ARIARoleRelationConcept} schema
 * @param {string} tag_name
 * @param {Map<string, import('#compiler').Attribute>} attribute_map
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

const ElementInteractivity = /** @type {const} */ ({
	Interactive: 'interactive',
	NonInteractive: 'non-interactive',
	Static: 'static'
});

/**
 * @param {string} tag_name
 * @param {Map<string, import('#compiler').Attribute>} attribute_map
 * @returns {ElementInteractivity[keyof ElementInteractivity]}
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
 * @param {Map<string, import('#compiler').Attribute>} attribute_map
 * @returns {boolean}
 */
function is_interactive_element(tag_name, attribute_map) {
	return element_interactivity(tag_name, attribute_map) === ElementInteractivity.Interactive;
}

/**
 * @param {string} tag_name
 * @param {Map<string, import('#compiler').Attribute>} attribute_map
 * @returns {boolean}
 */
function is_non_interactive_element(tag_name, attribute_map) {
	return element_interactivity(tag_name, attribute_map) === ElementInteractivity.NonInteractive;
}

/**
 * @param {string} tag_name
 * @param {Map<string, import('#compiler').Attribute>} attribute_map
 * @returns {boolean}
 */
function is_static_element(tag_name, attribute_map) {
	return element_interactivity(tag_name, attribute_map) === ElementInteractivity.Static;
}

/**
 * @param {import('aria-query').ARIARoleDefinitionKey} role
 * @param {string} tag_name
 * @param {Map<string, import('#compiler').Attribute>} attribute_map
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

// https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofilling-form-controls:-the-autocomplete-attribute
const address_type_tokens = ['shipping', 'billing'];
const autofill_field_name_tokens = [
	'',
	'on',
	'off',
	'name',
	'honorific-prefix',
	'given-name',
	'additional-name',
	'family-name',
	'honorific-suffix',
	'nickname',
	'username',
	'new-password',
	'current-password',
	'one-time-code',
	'organization-title',
	'organization',
	'street-address',
	'address-line1',
	'address-line2',
	'address-line3',
	'address-level4',
	'address-level3',
	'address-level2',
	'address-level1',
	'country',
	'country-name',
	'postal-code',
	'cc-name',
	'cc-given-name',
	'cc-additional-name',
	'cc-family-name',
	'cc-number',
	'cc-exp',
	'cc-exp-month',
	'cc-exp-year',
	'cc-csc',
	'cc-type',
	'transaction-currency',
	'transaction-amount',
	'language',
	'bday',
	'bday-day',
	'bday-month',
	'bday-year',
	'sex',
	'url',
	'photo'
];
const contact_type_tokens = ['home', 'work', 'mobile', 'fax', 'pager'];
const autofill_contact_field_name_tokens = [
	'tel',
	'tel-country-code',
	'tel-national',
	'tel-area-code',
	'tel-local',
	'tel-local-prefix',
	'tel-local-suffix',
	'tel-extension',
	'email',
	'impp'
];

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

const aria_attributes =
	'activedescendant atomic autocomplete busy checked colcount colindex colspan controls current describedby description details disabled dropeffect errormessage expanded flowto grabbed haspopup hidden invalid keyshortcuts label labelledby level live modal multiline multiselectable orientation owns placeholder posinset pressed readonly relevant required roledescription rowcount rowindex rowspan selected setsize sort valuemax valuemin valuenow valuetext'.split(
		' '
	);
/** @type {Record<string, string[]>} */
const a11y_required_attributes = {
	a: ['href'],
	area: ['alt', 'aria-label', 'aria-labelledby'],
	// html-has-lang
	html: ['lang'],
	// iframe-has-title
	iframe: ['title'],
	img: ['alt'],
	object: ['title', 'aria-label', 'aria-labelledby']
};
const a11y_distracting_elements = ['blink', 'marquee'];
const a11y_required_content = [
	// anchor-has-content
	'a',
	// heading-has-content
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6'
];
const a11y_labelable = [
	'button',
	'input',
	'keygen',
	'meter',
	'output',
	'progress',
	'select',
	'textarea'
];
const a11y_interactive_handlers = [
	// Keyboard events
	'keypress',
	'keydown',
	'keyup',
	// Click events
	'click',
	'contextmenu',
	'dblclick',
	'drag',
	'dragend',
	'dragenter',
	'dragexit',
	'dragleave',
	'dragover',
	'dragstart',
	'drop',
	'mousedown',
	'mouseenter',
	'mouseleave',
	'mousemove',
	'mouseout',
	'mouseover',
	'mouseup'
];
const a11y_recommended_interactive_handlers = [
	'click',
	'mousedown',
	'mouseup',
	'keypress',
	'keydown',
	'keyup'
];
const a11y_nested_implicit_semantics = new Map([
	['header', 'banner'],
	['footer', 'contentinfo']
]);
const a11y_implicit_semantics = new Map([
	['a', 'link'],
	['area', 'link'],
	['article', 'article'],
	['aside', 'complementary'],
	['body', 'document'],
	['button', 'button'],
	['datalist', 'listbox'],
	['dd', 'definition'],
	['dfn', 'term'],
	['dialog', 'dialog'],
	['details', 'group'],
	['dt', 'term'],
	['fieldset', 'group'],
	['figure', 'figure'],
	['form', 'form'],
	['h1', 'heading'],
	['h2', 'heading'],
	['h3', 'heading'],
	['h4', 'heading'],
	['h5', 'heading'],
	['h6', 'heading'],
	['hr', 'separator'],
	['img', 'img'],
	['li', 'listitem'],
	['link', 'link'],
	['main', 'main'],
	['menu', 'list'],
	['meter', 'progressbar'],
	['nav', 'navigation'],
	['ol', 'list'],
	['option', 'option'],
	['optgroup', 'group'],
	['output', 'status'],
	['progress', 'progressbar'],
	['section', 'region'],
	['summary', 'button'],
	['table', 'table'],
	['tbody', 'rowgroup'],
	['textarea', 'textbox'],
	['tfoot', 'rowgroup'],
	['thead', 'rowgroup'],
	['tr', 'row'],
	['ul', 'list']
]);
const menuitem_type_to_implicit_role = new Map([
	['command', 'menuitem'],
	['checkbox', 'menuitemcheckbox'],
	['radio', 'menuitemradio']
]);
const input_type_to_implicit_role = new Map([
	['button', 'button'],
	['image', 'button'],
	['reset', 'button'],
	['submit', 'button'],
	['checkbox', 'checkbox'],
	['radio', 'radio'],
	['range', 'slider'],
	['number', 'spinbutton'],
	['email', 'textbox'],
	['search', 'searchbox'],
	['tel', 'textbox'],
	['text', 'textbox'],
	['url', 'textbox']
]);

/**
 * Exceptions to the rule which follows common A11y conventions
 * TODO make this configurable by the user
 * @type {Record<string, string[]>}
 */
const a11y_non_interactive_element_to_interactive_role_exceptions = {
	ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
	ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
	li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
	table: ['grid'],
	td: ['gridcell'],
	fieldset: ['radiogroup', 'presentation']
};

const combobox_if_list = ['email', 'search', 'tel', 'text', 'url'];

/** @param {Map<string, import('#compiler').Attribute>} attribute_map */
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

/** @param {Map<string, import('#compiler').Attribute>} attribute_map */
function menuitem_implicit_role(attribute_map) {
	const type_attribute = attribute_map.get('type');
	if (!type_attribute) return;
	const type = get_static_text_value(type_attribute);
	if (!type) return;
	return menuitem_type_to_implicit_role.get(type);
}

/**
 * @param {string} name
 * @param {Map<string, import('#compiler').Attribute>} attribute_map
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

const invisible_elements = ['meta', 'html', 'script', 'style'];

/**
 * @param {import('#compiler').SvelteNode | null} parent
 * @param {string[]} elements
 */
function is_parent(parent, elements) {
	while (parent) {
		if (parent.type === 'SvelteElement') return true; // unknown, play it safe, so we don't warn
		if (parent.type === 'RegularElement') {
			return elements.includes(parent.name);
		}
		parent = /** @type {import('#compiler').TemplateNode} */ (parent).parent;
	}
	return false;
}

/**
 * @param {import('#compiler').Attribute} attribute
 * @param {import('aria-query').ARIAProperty} name
 * @param {import('aria-query').ARIAPropertyDefinition} schema
 * @param {string | true | null} value
 */
function validate_aria_attribute_value(attribute, name, schema, value) {
	const type = schema.type;
	const is_string = typeof value === 'string';

	if (value === null) return;
	if (value === true) value = 'true'; // TODO this is actually incorrect, and we should fix it

	if (type === 'boolean' && value !== 'true' && value !== 'false') {
		w.a11y_incorrect_aria_attribute_type_boolean(attribute, name);
	} else if (type === 'integer' && !Number.isInteger(+value)) {
		w.a11y_incorrect_aria_attribute_type_integer(attribute, name);
	} else if (type === 'number' && isNaN(+value)) {
		w.a11y_incorrect_aria_attribute_type(attribute, name, 'number');
	} else if ((type === 'string' || type === 'id') && !is_string) {
		w.a11y_incorrect_aria_attribute_type(attribute, name, 'string');
	} else if (type === 'idlist' && !is_string) {
		w.a11y_incorrect_aria_attribute_type_idlist(attribute, name);
	} else if (type === 'token') {
		const values = (schema.values ?? []).map((value) => value.toString());
		if (!values.includes(value.toLowerCase())) {
			w.a11y_incorrect_aria_attribute_type_token(
				attribute,
				name,
				list(values.map((v) => `"${v}"`))
			);
		}
	} else if (type === 'tokenlist') {
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
	} else if (type === 'tristate' && value !== 'true' && value !== 'false' && value !== 'mixed') {
		w.a11y_incorrect_aria_attribute_type_tristate(attribute, name);
	}
}

/**
 * @param {import('#compiler').RegularElement |import('#compiler').SvelteElement} node
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

/**
 * @param {import('#compiler').Attribute | undefined} attribute
 */
function get_static_value(attribute) {
	if (!attribute) return null;
	if (attribute.value === true) return true;
	if (is_text_attribute(attribute)) return attribute.value[0].data;
	return null;
}

/**
 * @param {import('#compiler').Attribute | undefined} attribute
 */
function get_static_text_value(attribute) {
	const value = get_static_value(attribute);
	if (value === true) return null;
	return value;
}

/**
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node
 * @param {import('./types.js').AnalysisState} state
 */
function check_element(node, state) {
	// foreign namespace means elements can have completely different meanings, therefore we don't check them
	if (state.options.namespace === 'foreign') return;

	/** @type {Map<string, import('#compiler').Attribute>} */
	const attribute_map = new Map();

	/** @type {Set<string>} */
	const handlers = new Set();

	/** @type {import('#compiler').Attribute[]} */
	const attributes = [];

	const is_dynamic_element = node.type === 'SvelteElement';

	let has_spread = false;
	let has_contenteditable_attr = false;
	let has_contenteditable_binding = false;

	for (const attribute of node.attributes) {
		if (attribute.type === 'SpreadAttribute') {
			has_spread = true;
		} else if (attribute.type === 'OnDirective') {
			handlers.add(attribute.name);
		} else if (attribute.type === 'Attribute') {
			if (is_event_attribute(attribute)) {
				handlers.add(attribute.name.slice(2));
			} else {
				attributes.push(attribute);
				attribute_map.set(attribute.name, attribute);
				if (attribute.name === 'contenteditable') {
					has_contenteditable_attr = true;
				}
			}
		} else if (
			attribute.type === 'BindDirective' &&
			ContentEditableBindings.includes(attribute.name)
		) {
			has_contenteditable_binding = true;
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
				if (match) {
					// TODO allow 'overloads' in messages, so that we can use the same code with and without suggestions
					w.a11y_unknown_aria_attribute_suggestion(attribute, type, match);
				} else {
					w.a11y_unknown_aria_attribute(attribute, type);
				}
			}

			if (name === 'aria-hidden' && regex_heading_tags.test(node.name)) {
				w.a11y_hidden(attribute, node.name);
			}

			// aria-proptypes
			let value = get_static_value(attribute);

			const schema = aria.get(/** @type {import('aria-query').ARIAProperty} */ (name));
			if (schema !== undefined) {
				validate_aria_attribute_value(
					attribute,
					/** @type {import('aria-query').ARIAProperty} */ (name),
					schema,
					value
				);
			}

			// aria-activedescendant-has-tabindex
			if (
				name === 'aria-activedescendant' &&
				!is_dynamic_element &&
				!is_interactive_element(node.name, attribute_map) &&
				!attribute_map.has('tabindex')
			) {
				w.a11y_aria_activedescendant_has_tabindex(attribute);
			}
		}

		// aria-role
		if (name === 'role') {
			if (invisible_elements.includes(node.name)) {
				// aria-unsupported-elements
				w.a11y_misplaced_role(attribute, node.name);
			}

			const value = get_static_value(attribute);
			if (typeof value === 'string') {
				for (const c_r of value.split(regex_whitespaces)) {
					const current_role =
						/** @type {import('aria-query').ARIARoleDefinitionKey} current_role */ (c_r);

					if (current_role && is_abstract_role(current_role)) {
						w.a11y_no_abstract_role(attribute, current_role);
					} else if (current_role && !aria_roles.includes(current_role)) {
						const match = fuzzymatch(current_role, aria_roles);
						if (match) {
							w.a11y_unknown_role_suggestion(attribute, current_role, match);
						} else {
							w.a11y_unknown_role(attribute, current_role);
						}
					}

					// no-redundant-roles
					if (
						current_role === get_implicit_role(node.name, attribute_map) &&
						// <ul role="list"> is ok because CSS list-style:none removes the semantics and this is a way to bring them back
						!['ul', 'ol', 'li'].includes(node.name)
					) {
						w.a11y_no_redundant_roles(attribute, current_role);
					}

					// Footers and headers are special cases, and should not have redundant roles unless they are the children of sections or articles.
					const is_parent_section_or_article = is_parent(node.parent, ['section', 'article']);
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
							const has_missing_props = required_role_props.some(
								(prop) => !attributes.find((a) => a.name === prop)
							);
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
						is_interactive_element(node.name, attribute_map) &&
						(is_non_interactive_roles(current_role) || is_presentation_role(current_role))
					) {
						w.a11y_no_interactive_element_to_noninteractive_role(node, node.name, current_role);
					}

					// no-noninteractive-element-to-interactive-role
					if (
						is_non_interactive_element(node.name, attribute_map) &&
						is_interactive_roles(current_role) &&
						!a11y_non_interactive_element_to_interactive_role_exceptions[node.name]?.includes(
							current_role
						)
					) {
						w.a11y_no_noninteractive_element_to_interactive_role(node, node.name, current_role);
					}
				}
			}
		}

		// no-access-key
		if (name === 'accesskey') {
			w.a11y_accesskey(attribute);
		}

		// no-autofocus
		if (name === 'autofocus') {
			w.a11y_autofocus(attribute);
		}

		// scope
		if (name === 'scope' && !is_dynamic_element && node.name !== 'th') {
			w.a11y_misplaced_scope(attribute);
		}

		// tabindex-no-positive
		if (name === 'tabindex') {
			const value = get_static_value(attribute);
			// @ts-ignore todo is tabindex=true correct case?
			if (!isNaN(value) && +value > 0) {
				w.a11y_positive_tabindex(attribute);
			}
		}
	}

	const role = attribute_map.get('role');
	const role_static_value = /** @type {import('aria-query').ARIARoleDefinitionKey} */ (
		get_static_text_value(role)
	);

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

	const role_value = /** @type {import('aria-query').ARIARoleDefinitionKey} */ (
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
		const { props } = /** @type {import('aria-query').ARIARoleDefinition} */ (
			roles_map.get(role_value)
		);
		const invalid_aria_props = aria.keys().filter((attribute) => !(attribute in props));
		const is_implicit = role_value && role === undefined;
		for (const attr of attributes) {
			if (
				invalid_aria_props.includes(/** @type {import('aria-query').ARIAProperty} */ (attr.name))
			) {
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

	if (handlers.has('mouseover') && !handlers.has('focus')) {
		w.a11y_mouse_events_have_key_events(node, 'mouseover', 'focus');
	}

	if (handlers.has('mouseout') && !handlers.has('blur')) {
		w.a11y_mouse_events_have_key_events(node, 'mouseout', 'blur');
	}

	// element-specific checks
	let contains_a11y_label = false;

	if (node.name === 'a') {
		const aria_label_attribute = attribute_map.get('aria-label');
		if (aria_label_attribute) {
			if (get_static_value(aria_label_attribute) !== '') {
				contains_a11y_label = true;
			}
		}

		const href = attribute_map.get('href') || attribute_map.get('xlink:href');
		if (href) {
			const href_value = get_static_text_value(href);
			if (href_value !== null) {
				if (href_value === '' || href_value === '#' || /^\W*javascript:/i.test(href_value)) {
					w.a11y_invalid_attribute(href, href_value, href.name);
				}
			}
		} else if (!has_spread) {
			const id_attribute = get_static_value(attribute_map.get('id'));
			const name_attribute = get_static_value(attribute_map.get('name'));
			if (!id_attribute && !name_attribute) {
				warn_missing_attribute(node, ['href']);
			}
		}
	} else if (!has_spread) {
		const required_attributes = a11y_required_attributes[node.name];
		if (required_attributes) {
			const has_attribute = required_attributes.some((name) => attribute_map.has(name));
			if (!has_attribute) {
				warn_missing_attribute(node, required_attributes);
			}
		}
	}

	if (node.name === 'input') {
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
	}

	if (node.name === 'img') {
		const alt_attribute = get_static_text_value(attribute_map.get('alt'));
		const aria_hidden = get_static_value(attribute_map.get('aria-hidden'));
		if (alt_attribute && !aria_hidden) {
			if (/\b(image|picture|photo)\b/i.test(alt_attribute)) {
				w.a11y_img_redundant_alt(node);
			}
		}
	}

	if (node.name === 'label') {
		/** @param {import('#compiler').TemplateNode} node */
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
		if (!attribute_map.has('for') && !has_input_child(node)) {
			w.a11y_label_has_associated_control(node);
		}
	}

	if (node.name === 'video') {
		const aria_hidden_attribute = attribute_map.get('aria-hidden');
		const aria_hidden_exist = aria_hidden_attribute && get_static_value(aria_hidden_attribute);
		if (attribute_map.has('muted') || aria_hidden_exist === 'true') {
			return;
		}
		let has_caption = false;
		const track = /** @type {import('#compiler').RegularElement | undefined} */ (
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
	}

	if (node.name === 'figcaption') {
		if (!is_parent(node.parent, ['figure'])) {
			w.a11y_figcaption_parent(node);
		}
	}

	if (node.name === 'figure') {
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
	}

	if (a11y_distracting_elements.includes(node.name)) {
		// no-distracting-elements
		w.a11y_distracting_elements(node, node.name);
	}

	// Check content
	if (
		!contains_a11y_label &&
		!has_contenteditable_binding &&
		a11y_required_content.includes(node.name) &&
		node.fragment.nodes.length === 0
	) {
		w.a11y_missing_content(node, node.name);
	}
}

/**
 * @type {import('zimmerframe').Visitors<import('#compiler').SvelteNode, import('./types.js').AnalysisState>}
 */
export const a11y_validators = {
	RegularElement(node, context) {
		check_element(node, context.state);
	},
	SvelteElement(node, context) {
		check_element(node, context.state);
	}
};

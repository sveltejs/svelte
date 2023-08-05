import { is_html, is_svg, is_void } from '../../../shared/utils/names.js';
import Node from './shared/Node.js';
import Attribute from './Attribute.js';
import Binding from './Binding.js';
import EventHandler from './EventHandler.js';
import Transition from './Transition.js';
import Animation from './Animation.js';
import Action from './Action.js';
import Class from './Class.js';
import StyleDirective from './StyleDirective.js';
import Text from './Text.js';
import { namespaces } from '../../utils/namespaces.js';
import map_children from './shared/map_children.js';
import {
	is_name_contenteditable,
	get_contenteditable_attr,
	has_contenteditable_attr
} from '../utils/contenteditable.js';
import {
	regex_dimensions,
	regex_starts_with_newline,
	regex_non_whitespace_character,
	regex_box_size
} from '../../utils/patterns.js';
import fuzzymatch from '../../utils/fuzzymatch.js';
import list from '../../utils/list.js';
import hash from '../utils/hash.js';
import Let from './Let.js';
import Expression from './shared/Expression.js';
import { string_literal } from '../utils/stringify.js';
import compiler_warnings from '../compiler_warnings.js';
import compiler_errors from '../compiler_errors.js';
import { roles, aria } from 'aria-query';
import {
	is_interactive_element,
	is_non_interactive_element,
	is_non_interactive_roles,
	is_presentation_role,
	is_interactive_roles,
	is_hidden_from_screen_reader,
	is_semantic_role_element,
	is_abstract_role,
	is_static_element,
	has_disabled_attribute,
	is_valid_autocomplete
} from '../utils/a11y.js';

const aria_attributes =
	'activedescendant atomic autocomplete busy checked colcount colindex colspan controls current describedby description details disabled dropeffect errormessage expanded flowto grabbed haspopup hidden invalid keyshortcuts label labelledby level live modal multiline multiselectable orientation owns placeholder posinset pressed readonly relevant required roledescription rowcount rowindex rowspan selected setsize sort valuemax valuemin valuenow valuetext'.split(
		' '
	);
const aria_attribute_set = new Set(aria_attributes);
const aria_roles = roles.keys();
const aria_role_set = new Set(aria_roles);
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
const a11y_distracting_elements = new Set(['blink', 'marquee']);
const a11y_required_content = new Set([
	// anchor-has-content
	'a',
	// heading-has-content
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6'
]);
const a11y_labelable = new Set([
	'button',
	'input',
	'keygen',
	'meter',
	'output',
	'progress',
	'select',
	'textarea'
]);
const a11y_interactive_handlers = new Set([
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
]);
const a11y_recommended_interactive_handlers = new Set([
	'click',
	'mousedown',
	'mouseup',
	'keypress',
	'keydown',
	'keyup'
]);
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
 */
const a11y_non_interactive_element_to_interactive_role_exceptions = {
	ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
	ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
	li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
	table: ['grid'],
	td: ['gridcell'],
	fieldset: ['radiogroup', 'presentation']
};
const combobox_if_list = new Set(['email', 'search', 'tel', 'text', 'url']);

/** @param {Map<string, import('./Attribute.js').default>} attribute_map */
function input_implicit_role(attribute_map) {
	const type_attribute = attribute_map.get('type');
	if (!type_attribute || !type_attribute.is_static) return;
	const type = /** @type {string} */ (type_attribute.get_static_value());
	const list_attribute_exists = attribute_map.has('list');
	if (list_attribute_exists && combobox_if_list.has(type)) {
		return 'combobox';
	}
	return input_type_to_implicit_role.get(type);
}

/** @param {Map<string, import('./Attribute.js').default>} attribute_map */
function menuitem_implicit_role(attribute_map) {
	const type_attribute = attribute_map.get('type');
	if (!type_attribute || !type_attribute.is_static) return;
	const type = /** @type {string} */ (type_attribute.get_static_value());
	return menuitem_type_to_implicit_role.get(type);
}

/**
 * @param {string} name
 * @param {Map<string, import('./Attribute.js').default>} attribute_map
 * @returns {string}
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
const invisible_elements = new Set(['meta', 'html', 'script', 'style']);
const valid_modifiers = new Set([
	'preventDefault',
	'stopPropagation',
	'stopImmediatePropagation',
	'capture',
	'once',
	'passive',
	'nonpassive',
	'self',
	'trusted'
]);
const passive_events = new Set(['wheel', 'touchstart', 'touchmove', 'touchend', 'touchcancel']);
const react_attributes = new Map([
	['className', 'class'],
	['htmlFor', 'for']
]);
const attributes_to_compact_whitespace = ['class', 'style'];

/**
 * @param {import('./interfaces.js').INode} parent
 * @param {string[]} elements
 */
function is_parent(parent, elements) {
	let check = false;
	while (parent) {
		const parent_name = /** @type {Element} */ (parent).name;
		if (elements.includes(parent_name)) {
			check = true;
			break;
		}
		if (parent.type === 'Element') {
			break;
		}
		parent = parent.parent;
	}
	return check;
}

/**
 * @param {Element} parent
 * @param {Element} element
 * @param {string} explicit_namespace
 */
function get_namespace(parent, element, explicit_namespace) {
	const parent_element = parent.find_nearest(/^Element/);
	if (!parent_element) {
		return explicit_namespace || (is_svg(element.name) ? namespaces.svg : null);
	}
	if (parent_element.namespace !== namespaces.foreign) {
		if (is_svg(element.name.toLowerCase())) return namespaces.svg;
		if (parent_element.name.toLowerCase() === 'foreignobject') return null;
	}
	return parent_element.namespace;
}

/**
 * @param {import('aria-query').ARIAPropertyDefinition} schema
 * @param {string | boolean} value
 * @returns {boolean}
 */
function is_valid_aria_attribute_value(schema, value) {
	switch (schema.type) {
		case 'boolean':
			return typeof value === 'boolean';
		case 'string':
		case 'id':
			return typeof value === 'string';
		case 'tristate':
			return typeof value === 'boolean' || value === 'mixed';
		case 'integer':
		case 'number':
			return typeof value !== 'boolean' && isNaN(Number(value)) === false;
		case 'token': // single token
			return (
				(schema.values || []).indexOf(typeof value === 'string' ? value.toLowerCase() : value) > -1
			);
		case 'idlist': // if list of ids, split each
			return (
				typeof value === 'string' &&
				value.split(regex_any_repeated_whitespaces).every((id) => typeof id === 'string')
			);
		case 'tokenlist': // if list of tokens, split each
			return (
				typeof value === 'string' &&
				value
					.split(regex_any_repeated_whitespaces)
					.every((token) => (schema.values || []).indexOf(token.toLowerCase()) > -1)
			);
		default:
			return false;
	}
}
const regex_any_repeated_whitespaces = /[\s]+/g;
const regex_heading_tags = /^h[1-6]$/;
const regex_illegal_attribute_character = /(^[0-9-.])|[\^$@%&#?!|()[\]{}^*+~;]/;

/** @extends Node<'Element'> */
export default class Element extends Node {
	/** @type {string} */
	name;

	/** @type {import('./shared/TemplateScope.js').default} */
	scope;

	/** @type {import('./Action.js').default[]} */
	actions = [];

	/** @type {import('./Binding.js').default[]} */
	bindings = [];

	/** @type {import('./Class.js').default[]} */
	classes = [];

	/** @type {import('./StyleDirective.js').default[]} */
	styles = [];

	/** @type {import('./EventHandler.js').default[]} */
	handlers = [];

	/** @type {import('./Let.js').default[]} */
	lets = [];

	/** @type {import('./Transition.js').default} */
	intro = null;

	/** @type {import('./Transition.js').default} */
	outro = null;

	/** @type {import('./Animation.js').default} */
	animation = null;

	/** @type {import('./interfaces.js').INode[]} */
	children;

	/** @type {string} */
	namespace;

	/** @type {boolean} */
	needs_manual_style_scoping;

	/** @type {import('./shared/Expression.js').default} */
	tag_expr;

	/** @type {boolean} */
	contains_a11y_label;
	get is_dynamic_element() {
		return this.name === 'svelte:element';
	}

	/**
	 * @param {import('../Component.js').default} component
	 * @param {import('./shared/Node.js').default} parent
	 * @param {import('./shared/TemplateScope.js').default} scope
	 * @param {any} info
	 */
	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.name = info.name;
		if (info.name === 'svelte:element') {
			if (typeof info.tag !== 'string') {
				this.tag_expr = new Expression(component, this, scope, info.tag);
			} else {
				this.tag_expr = new Expression(
					component,
					this,
					scope,
					/** @type {import('estree').Literal} */ (string_literal(info.tag))
				);
				this.name = info.tag;
			}
		} else {
			this.tag_expr = new Expression(
				component,
				this,
				scope,
				/** @type {import('estree').Literal} */ (string_literal(this.name))
			);
		}
		this.namespace = get_namespace(/** @type {Element} */ (parent), this, component.namespace);
		if (this.namespace !== namespaces.foreign) {
			if (this.name === 'pre' || this.name === 'textarea') {
				const first = info.children[0];
				if (first && first.type === 'Text') {
					// The leading newline character needs to be stripped because of a quirk,
					// it is ignored by browsers if the tag and its contents are set through
					// innerHTML (NOT if set through the innerHTML of the tag or dynamically).
					// Therefore strip it here but add it back in the appropriate
					// places if there's another newline afterwards.
					// see https://html.spec.whatwg.org/multipage/syntax.html#element-restrictions
					// see https://html.spec.whatwg.org/multipage/grouping-content.html#the-pre-element
					first.data = first.data.replace(regex_starts_with_newline, '');
				}
			}
			if (this.name === 'textarea') {
				if (info.children.length > 0) {
					const value_attribute = info.attributes.find((node) => node.name === 'value');
					if (value_attribute) {
						component.error(value_attribute, compiler_errors.textarea_duplicate_value);
						return;
					}
					// this is an egregious hack, but it's the easiest way to get <textarea>
					// children treated the same way as a value attribute
					info.attributes.push({
						type: 'Attribute',
						name: 'value',
						value: info.children
					});
					info.children = [];
				}
			}
			if (this.name === 'option') {
				// Special case — treat these the same way:
				//   <option>{foo}</option>
				//   <option value={foo}>{foo}</option>
				const value_attribute = info.attributes.find((attribute) => attribute.name === 'value');
				if (!value_attribute) {
					info.attributes.push({
						type: 'Attribute',
						name: 'value',
						value: info.children,
						synthetic: true
					});
				}
			}
		}
		const has_let = info.attributes.some((node) => node.type === 'Let');
		if (has_let) {
			scope = scope.child();
		}
		// Binding relies on Attribute, defer its evaluation
		const order = ['Binding']; // everything else is -1
		info.attributes.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
		info.attributes.forEach((node) => {
			switch (node.type) {
				case 'Action':
					this.actions.push(new Action(component, this, scope, node));
					break;
				case 'Attribute':
				case 'Spread':
					// special case
					if (node.name === 'xmlns') this.namespace = node.value[0].data;
					this.attributes.push(new Attribute(component, this, scope, node));
					break;
				case 'Binding':
					this.bindings.push(new Binding(component, this, scope, node));
					break;
				case 'Class':
					this.classes.push(new Class(component, this, scope, node));
					break;
				case 'StyleDirective':
					this.styles.push(new StyleDirective(component, this, scope, node));
					break;
				case 'EventHandler':
					this.handlers.push(new EventHandler(component, this, scope, node));
					break;
				case 'Let': {
					const l = new Let(component, this, scope, node);
					this.lets.push(l);
					const dependencies = new Set([l.name.name]);
					l.names.forEach((name) => {
						scope.add(name, dependencies, this);
					});
					break;
				}
				case 'Transition': {
					const transition = new Transition(component, this, scope, node);
					if (node.intro) this.intro = transition;
					if (node.outro) this.outro = transition;
					break;
				}
				case 'Animation':
					this.animation = new Animation(component, this, scope, node);
					break;
				default:
					throw new Error(`Not implemented: ${node.type}`);
			}
		});
		this.scope = scope;
		this.children = map_children(component, this, this.scope, info.children);
		this.validate();
		this.optimise();
		component.apply_stylesheet(this);
		if (this.parent) {
			if (
				this.actions.length > 0 ||
				this.animation ||
				this.bindings.length > 0 ||
				this.classes.length > 0 ||
				this.intro ||
				this.outro ||
				this.handlers.length > 0 ||
				this.styles.length > 0 ||
				this.name === 'option' ||
				this.is_dynamic_element ||
				this.tag_expr.dynamic_dependencies().length ||
				component.compile_options.dev
			) {
				this.parent.cannot_use_innerhtml(); // need to use add_location
				this.parent.not_static_content();
			}
		}
	}
	validate() {
		if (
			this.component.var_lookup.has(this.name) &&
			this.component.var_lookup.get(this.name).imported &&
			!is_svg(this.name) &&
			!is_html(this.name)
		) {
			this.component.warn(this, compiler_warnings.component_name_lowercase(this.name));
		}
		this.validate_attributes();
		this.validate_event_handlers();
		if (this.namespace === namespaces.foreign) {
			this.validate_bindings_foreign();
		} else {
			this.validate_attributes_a11y();
			this.validate_special_cases();
			this.validate_bindings();
			this.validate_content();
		}
	}
	validate_attributes() {
		const { component, parent } = this;
		this.attributes.forEach((attribute) => {
			if (attribute.is_spread) return;
			const name = attribute.name.toLowerCase();
			// Errors
			if (regex_illegal_attribute_character.test(name)) {
				return component.error(attribute, compiler_errors.illegal_attribute(name));
			}
			if (name === 'slot') {
				if (!attribute.is_static) {
					return component.error(attribute, compiler_errors.invalid_slot_attribute);
				}
				if (component.slot_outlets.has(name)) {
					return component.error(attribute, compiler_errors.duplicate_slot_attribute(name));
					// this code was unreachable. Still needed?
					// component.slot_outlets.add(name);
				}
				if (!(parent.type === 'SlotTemplate' || within_custom_element(parent))) {
					return component.error(attribute, compiler_errors.invalid_slotted_content);
				}
			}
			// Warnings
			if (this.namespace !== namespaces.foreign) {
				if (name === 'is') {
					component.warn(attribute, compiler_warnings.avoid_is);
				}
				if (react_attributes.has(attribute.name)) {
					component.warn(
						attribute,
						compiler_warnings.invalid_html_attribute(
							attribute.name,
							react_attributes.get(attribute.name)
						)
					);
				}
			}
		});
	}
	validate_attributes_a11y() {
		const { component, attributes, handlers } = this;
		const attribute_map = new Map();
		const handlers_map = new Map();
		attributes.forEach((attribute) => attribute_map.set(attribute.name, attribute));
		handlers.forEach((handler) => handlers_map.set(handler.name, handler));
		attributes.forEach((attribute) => {
			if (attribute.is_spread) return;
			const name = attribute.name.toLowerCase();
			// aria-props
			if (name.startsWith('aria-')) {
				if (invisible_elements.has(this.name)) {
					// aria-unsupported-elements
					component.warn(attribute, compiler_warnings.a11y_aria_attributes(this.name));
				}
				const type = name.slice(5);
				if (!aria_attribute_set.has(type)) {
					const match = fuzzymatch(type, aria_attributes);
					component.warn(attribute, compiler_warnings.a11y_unknown_aria_attribute(type, match));
				}
				if (name === 'aria-hidden' && regex_heading_tags.test(this.name)) {
					component.warn(attribute, compiler_warnings.a11y_hidden(this.name));
				}
				// aria-proptypes
				let value = attribute.get_static_value();
				if (value === 'true') value = true;
				if (value === 'false') value = false;
				if (
					value !== null &&
					value !== undefined &&
					aria.has(/** @type {import('aria-query').ARIAProperty} */ (name))
				) {
					const schema = aria.get(/** @type {import('aria-query').ARIAProperty} */ (name));
					if (!is_valid_aria_attribute_value(schema, value)) {
						component.warn(
							attribute,
							compiler_warnings.a11y_incorrect_attribute_type(schema, name)
						);
					}
				}
				// aria-activedescendant-has-tabindex
				if (
					name === 'aria-activedescendant' &&
					!this.is_dynamic_element &&
					!is_interactive_element(this.name, attribute_map) &&
					!attribute_map.has('tabindex')
				) {
					component.warn(attribute, compiler_warnings.a11y_aria_activedescendant_has_tabindex);
				}
			}
			// aria-role
			if (name === 'role') {
				if (invisible_elements.has(this.name)) {
					// aria-unsupported-elements
					component.warn(attribute, compiler_warnings.a11y_misplaced_role(this.name));
				}
				const value = attribute.get_static_value();
				if (typeof value === 'string') {
					value.split(regex_any_repeated_whitespaces).forEach(
						/** @param {import('aria-query').ARIARoleDefinitionKey} current_role */ (
							current_role
						) => {
							if (current_role && is_abstract_role(current_role)) {
								component.warn(attribute, compiler_warnings.a11y_no_abstract_role(current_role));
							} else if (current_role && !aria_role_set.has(current_role)) {
								const match = fuzzymatch(current_role, aria_roles);
								component.warn(attribute, compiler_warnings.a11y_unknown_role(current_role, match));
							}
							// no-redundant-roles
							if (
								current_role === get_implicit_role(this.name, attribute_map) &&
								// <ul role="list"> is ok because CSS list-style:none removes the semantics and this is a way to bring them back
								!['ul', 'ol', 'li'].includes(this.name)
							) {
								component.warn(attribute, compiler_warnings.a11y_no_redundant_roles(current_role));
							}
							// Footers and headers are special cases, and should not have redundant roles unless they are the children of sections or articles.
							const is_parent_section_or_article = is_parent(this.parent, ['section', 'article']);
							if (!is_parent_section_or_article) {
								const has_nested_redundant_role =
									current_role === a11y_nested_implicit_semantics.get(this.name);
								if (has_nested_redundant_role) {
									component.warn(
										attribute,
										compiler_warnings.a11y_no_redundant_roles(current_role)
									);
								}
							}
							// role-has-required-aria-props
							if (
								!this.is_dynamic_element &&
								!is_semantic_role_element(current_role, this.name, attribute_map)
							) {
								const role = roles.get(current_role);
								if (role) {
									const required_role_props = Object.keys(role.requiredProps);
									const has_missing_props = required_role_props.some(
										(prop) => !attributes.find((a) => a.name === prop)
									);
									if (has_missing_props) {
										component.warn(
											attribute,
											compiler_warnings.a11y_role_has_required_aria_props(
												current_role,
												required_role_props
											)
										);
									}
								}
							}
							// interactive-supports-focus
							if (
								!has_disabled_attribute(attribute_map) &&
								!is_hidden_from_screen_reader(this.name, attribute_map) &&
								!is_presentation_role(current_role) &&
								is_interactive_roles(current_role) &&
								is_static_element(this.name, attribute_map) &&
								!attribute_map.get('tabindex')
							) {
								const has_interactive_handlers = handlers.some((handler) =>
									a11y_interactive_handlers.has(handler.name)
								);
								if (has_interactive_handlers) {
									component.warn(
										this,
										compiler_warnings.a11y_interactive_supports_focus(current_role)
									);
								}
							}
							// no-interactive-element-to-noninteractive-role
							if (
								is_interactive_element(this.name, attribute_map) &&
								(is_non_interactive_roles(current_role) || is_presentation_role(current_role))
							) {
								component.warn(
									this,
									compiler_warnings.a11y_no_interactive_element_to_noninteractive_role(
										current_role,
										this.name
									)
								);
							}
							// no-noninteractive-element-to-interactive-role
							if (
								is_non_interactive_element(this.name, attribute_map) &&
								is_interactive_roles(current_role) &&
								!a11y_non_interactive_element_to_interactive_role_exceptions[this.name]?.includes(
									current_role
								)
							) {
								component.warn(
									this,
									compiler_warnings.a11y_no_noninteractive_element_to_interactive_role(
										current_role,
										this.name
									)
								);
							}
						}
					);
				}
			}
			// no-access-key
			if (name === 'accesskey') {
				component.warn(attribute, compiler_warnings.a11y_accesskey);
			}
			// no-autofocus
			if (name === 'autofocus') {
				component.warn(attribute, compiler_warnings.a11y_autofocus);
			}
			// scope
			if (name === 'scope' && !this.is_dynamic_element && this.name !== 'th') {
				component.warn(attribute, compiler_warnings.a11y_misplaced_scope);
			}
			// tabindex-no-positive
			if (name === 'tabindex') {
				const value = attribute.get_static_value();
				// @ts-ignore todo is tabindex=true correct case?
				if (!isNaN(value) && +value > 0) {
					component.warn(attribute, compiler_warnings.a11y_positive_tabindex);
				}
			}
		});
		// click-events-have-key-events
		if (handlers_map.has('click')) {
			const role = attribute_map.get('role');
			const is_non_presentation_role =
				role?.is_static &&
				!is_presentation_role(
					/** @type {import('aria-query').ARIARoleDefinitionKey} */ (role.get_static_value())
				);
			if (
				!this.is_dynamic_element &&
				!is_hidden_from_screen_reader(this.name, attribute_map) &&
				(!role || is_non_presentation_role) &&
				!is_interactive_element(this.name, attribute_map) &&
				!this.attributes.find((attr) => attr.is_spread)
			) {
				const has_key_event =
					handlers_map.has('keydown') || handlers_map.has('keyup') || handlers_map.has('keypress');
				if (!has_key_event) {
					component.warn(this, compiler_warnings.a11y_click_events_have_key_events);
				}
			}
		}
		const role = attribute_map.get('role');
		const role_static_value = /** @type {import('aria-query').ARIARoleDefinitionKey} */ (
			role?.get_static_value()
		);
		const role_value = /** @type {import('aria-query').ARIARoleDefinitionKey} */ (
			role ? role_static_value : get_implicit_role(this.name, attribute_map)
		);
		// no-noninteractive-tabindex
		if (
			!this.is_dynamic_element &&
			!is_interactive_element(this.name, attribute_map) &&
			!is_interactive_roles(role_static_value)
		) {
			const tab_index = attribute_map.get('tabindex');
			if (tab_index && (!tab_index.is_static || Number(tab_index.get_static_value()) >= 0)) {
				component.warn(this, compiler_warnings.a11y_no_noninteractive_tabindex);
			}
		}
		// role-supports-aria-props
		if (typeof role_value === 'string' && roles.has(role_value)) {
			const { props } = roles.get(role_value);
			const invalid_aria_props = new Set(aria.keys().filter((attribute) => !(attribute in props)));
			const is_implicit = role_value && role === undefined;
			attributes
				.filter((prop) => prop.type !== 'Spread')
				.forEach((prop) => {
					if (
						invalid_aria_props.has(/** @type {import('aria-query').ARIAProperty} */ (prop.name))
					) {
						component.warn(
							prop,
							compiler_warnings.a11y_role_supports_aria_props(
								prop.name,
								role_value,
								is_implicit,
								this.name
							)
						);
					}
				});
		}
		// no-noninteractive-element-interactions
		if (
			!has_contenteditable_attr(this) &&
			!is_hidden_from_screen_reader(this.name, attribute_map) &&
			!is_presentation_role(role_static_value) &&
			((!is_interactive_element(this.name, attribute_map) &&
				is_non_interactive_roles(role_static_value)) ||
				(is_non_interactive_element(this.name, attribute_map) && !role))
		) {
			const has_interactive_handlers = handlers.some((handler) =>
				a11y_recommended_interactive_handlers.has(handler.name)
			);
			if (has_interactive_handlers) {
				component.warn(
					this,
					compiler_warnings.a11y_no_noninteractive_element_interactions(this.name)
				);
			}
		}
		const has_dynamic_role = attribute_map.get('role') && !attribute_map.get('role').is_static;
		// no-static-element-interactions
		if (
			!has_dynamic_role &&
			!is_hidden_from_screen_reader(this.name, attribute_map) &&
			!is_presentation_role(role_static_value) &&
			!is_interactive_element(this.name, attribute_map) &&
			!is_interactive_roles(role_static_value) &&
			!is_non_interactive_element(this.name, attribute_map) &&
			!is_non_interactive_roles(role_static_value) &&
			!is_abstract_role(role_static_value)
		) {
			const interactive_handlers = handlers
				.map((handler) => handler.name)
				.filter((handlerName) => a11y_interactive_handlers.has(handlerName));
			if (interactive_handlers.length > 0) {
				component.warn(
					this,
					compiler_warnings.a11y_no_static_element_interactions(this.name, interactive_handlers)
				);
			}
		}
	}
	validate_special_cases() {
		const { component, attributes, handlers } = this;
		const attribute_map = new Map();
		const handlers_map = new Map();
		attributes.forEach((attribute) => attribute_map.set(attribute.name, attribute));
		handlers.forEach((handler) => handlers_map.set(handler.name, handler));
		if (this.name === 'a') {
			const href_attribute = attribute_map.get('href') || attribute_map.get('xlink:href');
			const id_attribute = attribute_map.get('id');
			const name_attribute = attribute_map.get('name');
			const target_attribute = attribute_map.get('target');
			const aria_label_attribute = attribute_map.get('aria-label');
			// links with target="_blank" should have noopener or noreferrer: https://developer.chrome.com/docs/lighthouse/best-practices/external-anchors-use-rel-noopener/
			// modern browsers add noopener by default, so we only need to check legacy browsers
			// legacy browsers don't support noopener so we only check for noreferrer there
			if (
				component.compile_options.legacy &&
				target_attribute &&
				target_attribute.get_static_value() === '_blank' &&
				href_attribute
			) {
				const href_static_value = href_attribute.get_static_value()
					? href_attribute.get_static_value().toLowerCase()
					: null;
				if (href_static_value === null || href_static_value.match(/^(https?:)?\/\//i)) {
					const rel = attribute_map.get('rel');
					if (rel == null || rel.is_static) {
						const rel_values = rel
							? rel.get_static_value().split(regex_any_repeated_whitespaces)
							: [];
						if (!rel || !rel_values.includes('noreferrer')) {
							component.warn(this, {
								code: 'security-anchor-rel-noreferrer',
								message:
									'Security: Anchor with "target=_blank" should have rel attribute containing the value "noreferrer"'
							});
						}
					}
				}
			}
			if (aria_label_attribute) {
				const aria_value = aria_label_attribute.get_static_value();
				if (aria_value != '') {
					this.contains_a11y_label = true;
				}
			}
			if (href_attribute) {
				const href_value = href_attribute.get_static_value();
				if (href_value === '' || href_value === '#' || /^\W*javascript:/i.test(href_value)) {
					component.warn(
						href_attribute,
						compiler_warnings.a11y_invalid_attribute(href_attribute.name, href_value)
					);
				}
			} else {
				const id_attribute_valid = id_attribute && id_attribute.get_static_value() !== '';
				const name_attribute_valid = name_attribute && name_attribute.get_static_value() !== '';
				if (!id_attribute_valid && !name_attribute_valid) {
					component.warn(this, compiler_warnings.a11y_missing_attribute('a', 'an', 'href'));
				}
			}
		} else {
			const required_attributes = a11y_required_attributes[this.name];
			if (required_attributes) {
				const has_attribute = required_attributes.some((name) => attribute_map.has(name));
				if (!has_attribute) {
					should_have_attribute(this, required_attributes);
				}
			}
		}
		if (this.name === 'input') {
			const type = attribute_map.get('type');
			if (type && type.get_static_value() === 'image') {
				const required_attributes = ['alt', 'aria-label', 'aria-labelledby'];
				const has_attribute = required_attributes.some((name) => attribute_map.has(name));
				if (!has_attribute) {
					should_have_attribute(this, required_attributes, 'input type="image"');
				}
			}
			// autocomplete-valid
			const autocomplete = attribute_map.get('autocomplete');
			if (type && autocomplete) {
				const type_value = type.get_static_value();
				const autocomplete_value = autocomplete.get_static_value();
				if (!is_valid_autocomplete(autocomplete_value)) {
					component.warn(
						autocomplete,
						compiler_warnings.a11y_autocomplete_valid(type_value, autocomplete_value)
					);
				}
			}
		}
		if (this.name === 'img') {
			const alt_attribute = attribute_map.get('alt');
			const aria_hidden_attribute = attribute_map.get('aria-hidden');
			const aria_hidden_exist = aria_hidden_attribute && aria_hidden_attribute.get_static_value();
			if (alt_attribute && !aria_hidden_exist) {
				const alt_value = alt_attribute.get_static_value();
				if (/\b(image|picture|photo)\b/i.test(alt_value)) {
					component.warn(this, compiler_warnings.a11y_img_redundant_alt);
				}
			}
		}
		if (this.name === 'label') {
			/** @param {import('./interfaces.js').INode[]} children */
			const has_input_child = (children) => {
				if (
					children.some(
						(child) =>
							child instanceof Element && (a11y_labelable.has(child.name) || child.name === 'slot')
					)
				) {
					return true;
				}
				for (const child of children) {
					if (!('children' in child) || child.children.length === 0) {
						continue;
					}
					if (has_input_child(child.children)) {
						return true;
					}
				}
				return false;
			};
			if (!attribute_map.has('for') && !has_input_child(this.children)) {
				component.warn(this, compiler_warnings.a11y_label_has_associated_control);
			}
		}
		if (this.name === 'video') {
			const aria_hidden_attribute = attribute_map.get('aria-hidden');
			const aria_hidden_exist = aria_hidden_attribute && aria_hidden_attribute.get_static_value();
			if (attribute_map.has('muted') || aria_hidden_exist === 'true') {
				return;
			}
			let has_caption;
			const track = this.children.find(/** @param {Element} i */ (i) => i.name === 'track');
			if (track) {
				has_caption = track.attributes.find(
					(a) => a.name === 'kind' && a.get_static_value() === 'captions'
				);
			}
			if (!has_caption) {
				component.warn(this, compiler_warnings.a11y_media_has_caption);
			}
		}
		if (a11y_distracting_elements.has(this.name)) {
			// no-distracting-elements
			component.warn(this, compiler_warnings.a11y_distracting_elements(this.name));
		}
		if (this.name === 'figcaption') {
			let { parent } = this;
			let is_figure_parent = false;
			while (parent) {
				if (/** @type {Element} */ (parent).name === 'figure') {
					is_figure_parent = true;
					break;
				}
				if (parent.type === 'Element') {
					break;
				}
				parent = parent.parent;
			}
			if (!is_figure_parent) {
				component.warn(this, compiler_warnings.a11y_structure_immediate);
			}
		}
		if (this.name === 'figure') {
			const children = this.children.filter((node) => {
				if (node.type === 'Comment') return false;
				if (node.type === 'Text') return regex_non_whitespace_character.test(node.data);
				return true;
			});
			const index = children.findIndex(
				(child) => /** @type {Element} */ (child).name === 'figcaption'
			);
			if (index !== -1 && index !== 0 && index !== children.length - 1) {
				component.warn(children[index], compiler_warnings.a11y_structure_first_or_last);
			}
		}
		if (handlers_map.has('mouseover') && !handlers_map.has('focus')) {
			component.warn(
				this,
				compiler_warnings.a11y_mouse_events_have_key_events('mouseover', 'focus')
			);
		}
		if (handlers_map.has('mouseout') && !handlers_map.has('blur')) {
			component.warn(this, compiler_warnings.a11y_mouse_events_have_key_events('mouseout', 'blur'));
		}
	}
	validate_bindings_foreign() {
		this.bindings.forEach((binding) => {
			if (binding.name !== 'this') {
				return this.component.error(binding, compiler_errors.invalid_binding_foreign(binding.name));
			}
		});
	}
	validate_bindings() {
		const { component } = this;
		const check_type_attribute = () => {
			const attribute = this.attributes.find(
				/** @param {import('./Attribute.js').default} attribute */ (attribute) =>
					attribute.name === 'type'
			);
			if (!attribute) return null;
			if (!attribute.is_static) {
				return component.error(attribute, compiler_errors.invalid_type);
			}
			const value = attribute.get_static_value();
			if (value === true) {
				return component.error(attribute, compiler_errors.missing_type);
			}
			return value;
		};
		this.bindings.forEach((binding) => {
			const { name } = binding;
			if (name === 'value') {
				if (this.name !== 'input' && this.name !== 'textarea' && this.name !== 'select') {
					return component.error(
						binding,
						compiler_errors.invalid_binding_elements(this.name, 'value')
					);
				}
				if (this.name === 'select') {
					const attribute = this.attributes.find(
						/** @param {import('./Attribute.js').default} attribute */
						(attribute) => attribute.name === 'multiple'
					);
					if (attribute && !attribute.is_static) {
						return component.error(attribute, compiler_errors.dynamic_multiple_attribute);
					}
				} else {
					check_type_attribute();
				}
			} else if (name === 'checked' || name === 'indeterminate') {
				if (this.name !== 'input') {
					return component.error(
						binding,
						compiler_errors.invalid_binding_elements(this.name, name)
					);
				}
				const type = check_type_attribute();
				if (type !== 'checkbox') {
					return component.error(
						binding,
						compiler_errors.invalid_binding_no_checkbox(name, type === 'radio')
					);
				}
			} else if (name === 'group') {
				if (this.name !== 'input') {
					return component.error(
						binding,
						compiler_errors.invalid_binding_elements(this.name, 'group')
					);
				}
				const type = check_type_attribute();
				if (type !== 'checkbox' && type !== 'radio') {
					return component.error(
						binding,
						compiler_errors.invalid_binding_element_with(
							'<input type="checkbox"> or <input type="radio">',
							'group'
						)
					);
				}
			} else if (name === 'files') {
				if (this.name !== 'input') {
					return component.error(
						binding,
						compiler_errors.invalid_binding_elements(this.name, 'files')
					);
				}
				const type = check_type_attribute();
				if (type !== 'file') {
					return component.error(
						binding,
						compiler_errors.invalid_binding_element_with('<input type="file">', 'files')
					);
				}
			} else if (name === 'open') {
				if (this.name !== 'details') {
					return component.error(
						binding,
						compiler_errors.invalid_binding_element_with('<details>', name)
					);
				}
			} else if (
				name === 'currentTime' ||
				name === 'duration' ||
				name === 'paused' ||
				name === 'buffered' ||
				name === 'seekable' ||
				name === 'played' ||
				name === 'volume' ||
				name === 'muted' ||
				name === 'playbackRate' ||
				name === 'seeking' ||
				name === 'ended' ||
				name === 'readyState'
			) {
				if (this.name !== 'audio' && this.name !== 'video') {
					return component.error(
						binding,
						compiler_errors.invalid_binding_element_with('audio> or <video>', name)
					);
				}
			} else if (name === 'videoHeight' || name === 'videoWidth') {
				if (this.name !== 'video') {
					return component.error(
						binding,
						compiler_errors.invalid_binding_element_with('<video>', name)
					);
				}
			} else if (regex_dimensions.test(name)) {
				if (this.name === 'svg' && (name === 'offsetWidth' || name === 'offsetHeight')) {
					return component.error(
						binding,
						compiler_errors.invalid_binding_on(
							binding.name,
							`<svg>. Use '${name.replace('offset', 'client')}' instead`
						)
					);
				} else if (is_svg(this.name)) {
					return component.error(
						binding,
						compiler_errors.invalid_binding_on(binding.name, 'SVG elements')
					);
				} else if (is_void(this.name)) {
					return component.error(
						binding,
						compiler_errors.invalid_binding_on(
							binding.name,
							`void elements like <${this.name}>. Use a wrapper element instead`
						)
					);
				}
			} else if (name === 'naturalWidth' || name === 'naturalHeight') {
				if (this.name !== 'img') {
					return component.error(
						binding,
						compiler_errors.invalid_binding_element_with('<img>', name)
					);
				}
			} else if (is_name_contenteditable(name)) {
				const contenteditable = get_contenteditable_attr(this);
				if (!contenteditable) {
					return component.error(binding, compiler_errors.missing_contenteditable_attribute);
				} else if (contenteditable && !contenteditable.is_static) {
					return component.error(
						contenteditable,
						compiler_errors.dynamic_contenteditable_attribute
					);
				}
			} else if (name !== 'this' && !regex_box_size.test(name)) {
				return component.error(binding, compiler_errors.invalid_binding(binding.name));
			}
		});
	}
	validate_content() {
		if (!a11y_required_content.has(this.name)) return;
		if (this.contains_a11y_label) return;
		if (this.bindings.some((binding) => ['textContent', 'innerHTML'].includes(binding.name)))
			return;
		if (this.children.length === 0) {
			this.component.warn(this, compiler_warnings.a11y_missing_content(this.name));
		}
	}
	validate_event_handlers() {
		const { component } = this;
		this.handlers.forEach((handler) => {
			if (handler.modifiers.has('passive') && handler.modifiers.has('preventDefault')) {
				return component.error(
					handler,
					compiler_errors.invalid_event_modifier_combination('passive', 'preventDefault')
				);
			}
			if (handler.modifiers.has('passive') && handler.modifiers.has('nonpassive')) {
				return component.error(
					handler,
					compiler_errors.invalid_event_modifier_combination('passive', 'nonpassive')
				);
			}
			handler.modifiers.forEach((modifier) => {
				if (!valid_modifiers.has(modifier)) {
					return component.error(
						handler,
						compiler_errors.invalid_event_modifier(list(Array.from(valid_modifiers)))
					);
				}
				if (modifier === 'passive') {
					if (passive_events.has(handler.name)) {
						if (handler.can_make_passive) {
							component.warn(handler, compiler_warnings.redundant_event_modifier_for_touch);
						}
					} else {
						component.warn(handler, compiler_warnings.redundant_event_modifier_passive);
					}
				}
				if (component.compile_options.legacy && (modifier === 'once' || modifier === 'passive')) {
					// TODO this could be supported, but it would need a few changes to
					// how event listeners work
					return component.error(handler, compiler_errors.invalid_event_modifier_legacy(modifier));
				}
			});
			if (
				passive_events.has(handler.name) &&
				handler.can_make_passive &&
				!handler.modifiers.has('preventDefault') &&
				!handler.modifiers.has('nonpassive')
			) {
				// touch/wheel events should be passive by default
				handler.modifiers.add('passive');
			}
		});
	}
	is_media_node() {
		return this.name === 'audio' || this.name === 'video';
	}
	add_css_class() {
		if (this.attributes.some((attr) => attr.is_spread)) {
			this.needs_manual_style_scoping = true;
			return;
		}
		const { id } = this.component.stylesheet;
		const class_attribute = this.attributes.find((a) => a.name === 'class');
		if (class_attribute && !class_attribute.is_true) {
			if (class_attribute.chunks.length === 1 && class_attribute.chunks[0].type === 'Text') {
				/** @type {import('./Text.js').default} */ (class_attribute.chunks[0]).data += ` ${id}`;
			} else {
				/** @type {import('./shared/Node.js').default[]} */ (class_attribute.chunks).push(
					new Text(
						this.component,
						this,
						this.scope,
						/** @type {any} */ ({
							type: 'Text',
							data: ` ${id}`,
							synthetic: true
						})
					)
				);
			}
		} else {
			this.attributes.push(
				new Attribute(
					this.component,
					this,
					this.scope,
					/** @type {any} */ ({
						type: 'Attribute',
						name: 'class',
						value: [{ type: 'Text', data: id, synthetic: true }]
					})
				)
			);
		}
	}
	get slot_template_name() {
		return /** @type {string} */ (
			this.attributes.find((attribute) => attribute.name === 'slot').get_static_value()
		);
	}
	optimise() {
		attributes_to_compact_whitespace.forEach((attribute_name) => {
			const attribute = this.attributes.find((a) => a.name === attribute_name);
			if (attribute && !attribute.is_true) {
				attribute.chunks.forEach((chunk, index) => {
					if (chunk.type === 'Text') {
						let data = chunk.data.replace(regex_any_repeated_whitespaces, ' ');
						if (index === 0) {
							data = data.trimLeft();
						} else if (index === attribute.chunks.length - 1) {
							data = data.trimRight();
						}
						chunk.data = data;
					}
				});
			}
		});
	}
	get can_use_textcontent() {
		return (
			this.is_static_content &&
			this.children.every((node) => node.type === 'Text' || node.type === 'MustacheTag')
		);
	}
	get can_optimise_to_html_string() {
		const can_use_textcontent = this.can_use_textcontent;
		const is_template_with_text_content = this.name === 'template' && can_use_textcontent;
		return (
			!is_template_with_text_content &&
			!this.namespace &&
			(this.can_use_innerhtml || can_use_textcontent) &&
			this.children.length > 0
		);
	}
	get can_optimise_hydration() {
		// In contrast to normal html string optimization, we also bail in case of mustache tags even
		// if they seem to contain static content. This is because we cannot know whether that static
		// value is different between client and server builds, e.g. {browser ? 'hi' : 'bye'} which
		// becomes {'hi'} and {'bye'} respectively.
		const is_static_text_content =
			this.is_static_content && this.children.every((node) => node.type === 'Text');
		return this.can_optimise_to_html_string && (this.can_use_innerhtml || is_static_text_content);
	}
	hash() {
		return `svelte-${hash(this.component.source.slice(this.start, this.end))}`;
	}
}
const regex_starts_with_vowel = /^[aeiou]/;

/**
 * @param {any} node
 * @param {string[]} attributes
 * @param {any} name
 */
function should_have_attribute(node, attributes, name = node.name) {
	const article = regex_starts_with_vowel.test(attributes[0]) ? 'an' : 'a';
	const sequence =
		attributes.length > 1
			? attributes.slice(0, -1).join(', ') + ` or ${attributes[attributes.length - 1]}`
			: attributes[0];
	node.component.warn(node, compiler_warnings.a11y_missing_attribute(name, article, sequence));
}
const regex_minus_sign = /-/;

/** @param {import('./interfaces.js').INode} parent */
function within_custom_element(parent) {
	while (parent) {
		if (parent.type === 'InlineComponent') return false;
		if (parent.type === 'Element') {
			if (regex_minus_sign.test(parent.name) || parent.is_dynamic_element) return true;
		}
		parent = parent.parent;
	}
	return false;
}

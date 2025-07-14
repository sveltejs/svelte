/** @import { ARIARoleRelationConcept  } from 'aria-query' */
import { roles as roles_map, elementRoles } from 'aria-query';
// @ts-expect-error package doesn't provide typings
import { AXObjects, elementAXObjects } from 'axobject-query';

export const aria_attributes =
	'activedescendant atomic autocomplete busy checked colcount colindex colspan controls current describedby description details disabled dropeffect errormessage expanded flowto grabbed haspopup hidden invalid keyshortcuts label labelledby level live modal multiline multiselectable orientation owns placeholder posinset pressed readonly relevant required roledescription rowcount rowindex rowspan selected setsize sort valuemax valuemin valuenow valuetext'.split(
		' '
	);

/** @type {Record<string, string[]>} */
export const a11y_required_attributes = {
	a: ['href'],
	area: ['alt', 'aria-label', 'aria-labelledby'],
	// html-has-lang
	html: ['lang'],
	// iframe-has-title
	iframe: ['title'],
	img: ['alt'],
	object: ['title', 'aria-label', 'aria-labelledby']
};

export const a11y_distracting_elements = ['blink', 'marquee'];

// this excludes `<a>` and `<button>` because they are handled separately
export const a11y_required_content = [
	// heading-has-content
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6'
];

export const a11y_labelable = [
	'button',
	'input',
	'keygen',
	'meter',
	'output',
	'progress',
	'select',
	'textarea'
];

export const a11y_interactive_handlers = [
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

export const a11y_recommended_interactive_handlers = [
	'click',
	'mousedown',
	'mouseup',
	'keypress',
	'keydown',
	'keyup'
];

export const a11y_nested_implicit_semantics = new Map([
	['header', 'banner'],
	['footer', 'contentinfo']
]);

export const a11y_implicit_semantics = new Map([
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

export const menuitem_type_to_implicit_role = new Map([
	['command', 'menuitem'],
	['checkbox', 'menuitemcheckbox'],
	['radio', 'menuitemradio']
]);

export const input_type_to_implicit_role = new Map([
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
export const a11y_non_interactive_element_to_interactive_role_exceptions = {
	ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
	ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
	li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
	table: ['grid'],
	td: ['gridcell'],
	fieldset: ['radiogroup', 'presentation']
};

export const combobox_if_list = ['email', 'search', 'tel', 'text', 'url'];

// https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofilling-form-controls:-the-autocomplete-attribute
export const address_type_tokens = ['shipping', 'billing'];

export const autofill_field_name_tokens = [
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

export const contact_type_tokens = ['home', 'work', 'mobile', 'fax', 'pager'];

export const autofill_contact_field_name_tokens = [
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

export const ElementInteractivity = /** @type {const} */ ({
	Interactive: 'interactive',
	NonInteractive: 'non-interactive',
	Static: 'static'
});

export const invisible_elements = ['meta', 'html', 'script', 'style'];

export const aria_roles = roles_map.keys();

export const abstract_roles = aria_roles.filter((role) => roles_map.get(role)?.abstract);

const non_abstract_roles = aria_roles.filter((name) => !abstract_roles.includes(name));

export const non_interactive_roles = non_abstract_roles
	.filter((name) => {
		const role = roles_map.get(name);
		return (
			// 'toolbar' does not descend from widget, but it does support
			// aria-activedescendant, thus in practice we treat it as a widget.
			// focusable tabpanel elements are recommended if any panels in a set contain content where the first element in the panel is not focusable.
			// 'generic' is meant to have no semantic meaning.
			// 'cell' is treated as CellRole by the AXObject which is interactive, so we treat 'cell' it as interactive as well.
			!['toolbar', 'tabpanel', 'generic', 'cell'].includes(name) &&
			!role?.superClass.some((classes) => classes.includes('widget') || classes.includes('window'))
		);
	})
	.concat(
		// The `progressbar` is descended from `widget`, but in practice, its
		// value is always `readonly`, so we treat it as a non-interactive role.
		'progressbar'
	);

export const interactive_roles = non_abstract_roles.filter(
	(name) =>
		!non_interactive_roles.includes(name) &&
		// 'generic' is meant to have no semantic meaning.
		name !== 'generic'
);

export const presentation_roles = ['presentation', 'none'];

/** @type {ARIARoleRelationConcept[]} */
export const non_interactive_element_role_schemas = [];

/** @type {ARIARoleRelationConcept[]} */
export const interactive_element_role_schemas = [];

for (const [schema, roles] of elementRoles.entries()) {
	if ([...roles].every((role) => role !== 'generic' && non_interactive_roles.includes(role))) {
		non_interactive_element_role_schemas.push(schema);
	}

	if ([...roles].every((role) => interactive_roles.includes(role))) {
		interactive_element_role_schemas.push(schema);
	}
}

const interactive_ax_objects = [...AXObjects.keys()].filter(
	(name) => AXObjects.get(name).type === 'widget'
);

/** @type {ARIARoleRelationConcept[]} */
export const interactive_element_ax_object_schemas = [];

/** @type {ARIARoleRelationConcept[]} */
export const non_interactive_element_ax_object_schemas = [];

const non_interactive_ax_objects = [...AXObjects.keys()].filter((name) =>
	['windows', 'structure'].includes(AXObjects.get(name).type)
);

for (const [schema, ax_object] of elementAXObjects.entries()) {
	if ([...ax_object].every((role) => interactive_ax_objects.includes(role))) {
		interactive_element_ax_object_schemas.push(schema);
	}

	if ([...ax_object].every((role) => non_interactive_ax_objects.includes(role))) {
		non_interactive_element_ax_object_schemas.push(schema);
	}
}

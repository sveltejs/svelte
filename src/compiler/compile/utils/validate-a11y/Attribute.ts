import Attribute from '../../nodes/Attribute';
import fuzzymatch from '../../../utils/fuzzymatch';
import { array_to_string } from './utils';

const validators = [
	no_auto_focus,
	unsupported_aria_element,
	invalid_aria_attribute,
	no_aria_hidden,
	no_misplaced_role,
	no_unknown_role,
	no_access_key,
	no_misplaced_scope,
	tabindex_no_positive,
];

export default function validateA11y(attribute: Attribute) {
	if (attribute.is_spread) {
		return;
	}

	const name = attribute.name.toLowerCase();

	for (const validator of validators) {
		validator(attribute, name);
	}
}

function no_auto_focus(attribute: Attribute, name: string) {
	if (name === 'autofocus') {
		attribute.parent.component.warn(attribute, {
			code: `a11y-autofocus`,
			message: `A11y: Avoid using autofocus`,
		});
	}
}

const invisible_elements = new Set(['meta', 'html', 'script', 'style']);
function unsupported_aria_element(attribute: Attribute, name: string) {
	if (name.startsWith('aria-')) {
		if (invisible_elements.has(attribute.parent.name)) {
			// aria-unsupported-elements
			attribute.parent.component.warn(attribute, {
				code: `a11y-aria-attributes`,
				message: `A11y: <${attribute.parent.name}> should not have aria-* attributes`,
			});
		}
	}
}

// https://github.com/A11yance/aria-query/blob/master/src/ariaPropsMap.js
const aria_attribute_maps = new Map([
	['aria-details', { type: 'idlist' }],
	[
		'aria-activedescendant',
		{
			type: 'id',
		},
	],
	[
		'aria-atomic',
		{
			type: 'boolean',
		},
	],
	[
		'aria-autocomplete',
		{
			type: 'token',
			values: new Set(['inline', 'list', 'both', 'none']),
		},
	],
	[
		'aria-busy',
		{
			type: 'boolean',
		},
	],
	[
		'aria-checked',
		{
			type: 'tristate',
		},
	],
	[
		'aria-colcount',
		{
			type: 'integer',
		},
	],
	[
		'aria-colindex',
		{
			type: 'integer',
		},
	],
	[
		'aria-colspan',
		{
			type: 'integer',
		},
	],
	[
		'aria-controls',
		{
			type: 'idlist',
		},
	],
	[
		'aria-current',
		{
			type: 'token',
			values: new Set([
				'page',
				'step',
				'location',
				'date',
				'time',
				'true',
				'false',
			]),
		},
	],
	[
		'aria-describedby',
		{
			type: 'idlist',
		},
	],
	[
		'aria-disabled',
		{
			type: 'boolean',
		},
	],
	[
		'aria-dropeffect',
		{
			type: 'tokenlist',
			values: new Set(['copy', 'move', 'link', 'execute', 'popup', 'none']),
		},
	],
	[
		'aria-errormessage',
		{
			type: 'string',
		},
	],
	[
		'aria-expanded',
		{
			type: 'boolean',
			allowundefined: true,
		},
	],
	[
		'aria-flowto',
		{
			type: 'idlist',
		},
	],
	[
		'aria-grabbed',
		{
			type: 'boolean',
			allowundefined: true,
		},
	],
	[
		'aria-haspopup',
		{
			type: 'token',
			values: new Set([
				'false',
				'true',
				'menu',
				'listbox',
				'tree',
				'grid',
				'dialog',
			]),
		},
	],
	[
		'aria-hidden',
		{
			type: 'boolean',
		},
	],
	[
		'aria-invalid',
		{
			type: 'token',
			values: new Set(['grammar', 'false', 'spelling', 'true']),
		},
	],
	[
		'aria-keyshortcuts',
		{
			type: 'string',
		},
	],
	[
		'aria-label',
		{
			type: 'string',
		},
	],
	[
		'aria-labelledby',
		{
			type: 'idlist',
		},
	],
	[
		'aria-level',
		{
			type: 'integer',
		},
	],
	[
		'aria-live',
		{
			type: 'token',
			values: new Set(['off', 'polite', 'assertive']),
		},
	],
	[
		'aria-modal',
		{
			type: 'boolean',
		},
	],
	[
		'aria-multiline',
		{
			type: 'boolean',
		},
	],
	[
		'aria-multiselectable',
		{
			type: 'boolean',
		},
	],
	[
		'aria-orientation',
		{
			type: 'token',
			values: new Set(['vertical', 'horizontal']),
		},
	],
	[
		'aria-owns',
		{
			type: 'idlist',
		},
	],
	[
		'aria-placeholder',
		{
			type: 'string',
		},
	],
	[
		'aria-posinset',
		{
			type: 'integer',
		},
	],
	[
		'aria-pressed',
		{
			type: 'tristate',
		},
	],
	[
		'aria-readonly',
		{
			type: 'boolean',
		},
	],
	[
		'aria-relevant',
		{
			type: 'tokenlist',
			values: new Set(['additions', 'removals', 'text', 'all']),
		},
	],
	[
		'aria-required',
		{
			type: 'boolean',
		},
	],
	[
		'aria-roledescription',
		{
			type: 'string',
		},
	],
	[
		'aria-rowcount',
		{
			type: 'integer',
		},
	],
	[
		'aria-rowindex',
		{
			type: 'integer',
		},
	],
	[
		'aria-rowspan',
		{
			type: 'integer',
		},
	],
	[
		'aria-selected',
		{
			type: 'boolean',
			allowundefined: true,
		},
	],
	[
		'aria-setsize',
		{
			type: 'integer',
		},
	],
	[
		'aria-sort',
		{
			type: 'token',
			values: new Set(['ascending', 'descending', 'none', 'other']),
		},
	],
	[
		'aria-valuemax',
		{
			type: 'number',
		},
	],
	[
		'aria-valuemin',
		{
			type: 'number',
		},
	],
	[
		'aria-valuenow',
		{
			type: 'number',
		},
	],
	[
		'aria-valuetext',
		{
			type: 'string',
		},
	],
]);

const aria_attributes = [...aria_attribute_maps.keys()];
const aria_attribute_set = new Set(aria_attributes);
function invalid_aria_attribute(attribute: Attribute, name: string) {
	if (name.startsWith('aria-')) {
		if (!aria_attribute_set.has(name)) {
			const match = fuzzymatch(name, aria_attributes);
			let message = `A11y: Unknown aria attribute '${name}'`;
			if (match) message += ` (did you mean '${match}'?)`;

			attribute.parent.component.warn(attribute, {
				code: `a11y-unknown-aria-attribute`,
				message,
			});
		} else {
			const value = attribute.get_static_value();
			if (value !== undefined) {
				const {
					type: permitted_type,
					values: permitted_values,
				} = aria_attribute_maps.get(name);
				if (!validate_attribute(value, permitted_type, permitted_values)) {
					attribute.parent.component.warn(attribute, {
						code: `a11y-invalid-aria-attribute-value`,
						message: validate_attribute_error_message(
							name,
							permitted_type,
							permitted_values
						),
					});
				}
			}
		}
	}
}

function validate_attribute(value, expected_types, permitted_values) {
	switch (expected_types) {
		case 'boolean':
			return (
				typeof value === 'boolean' || value === 'true' || value === 'false'
			);
		case 'string':
		case 'id':
			return typeof value === 'string';
		case 'tristate':
			return (
				validate_attribute(value, 'boolean', undefined) || value === 'mixed'
			);
		case 'integer':
		case 'number':
			return (
				typeof value === 'number' ||
				(typeof value === 'string' && isNaN(Number(value)) === false)
			);
		case 'token':
			return permitted_values.has(
				typeof value === 'string' ? value.toLowerCase() : String(value)
			);
		case 'idlist':
			return (
				typeof value === 'string' &&
				value
					.split(' ')
					.every(token => validate_attribute(token, 'id', undefined))
			);
		case 'tokenlist':
			return (
				typeof value === 'string' &&
				value
					.split(' ')
					.every(token => permitted_values.has(token.toLowerCase()))
			);
		default:
			return false;
	}
}
function validate_attribute_error_message(name, type, permitted_values) {
	switch (type) {
		case 'tristate':
			return `The value for ${name} must be a boolean or the string "mixed".`;
		case 'token':
			return `The value for ${name} must be a single token from the following: ${array_to_string(
				Array.from(permitted_values)
			)}.`;
		case 'tokenlist':
			return `The value for ${name} must be a list of one or more tokens from the following: ${array_to_string(
				Array.from(permitted_values)
			)}.`;
		case 'idlist':
			return `The value for ${name} must be a list of strings that represent DOM element IDs (idlist)`;
		case 'id':
			return `The value for ${name} must be a string that represents a DOM element ID`;
		case 'boolean':
		case 'string':
		case 'integer':
		case 'number':
		default:
			return `The value for ${name} must be a ${type}.`;
	}
}

function no_aria_hidden(attribute: Attribute, name: string) {
	if (name === 'aria-hidden' && /^h[1-6]$/.test(attribute.parent.name)) {
		attribute.parent.component.warn(attribute, {
			code: `a11y-hidden`,
			message: `A11y: <${attribute.parent.name}> element should not be hidden`,
		});
	}
}

function no_misplaced_role(attribute: Attribute, name: string) {
	if (name === 'role') {
		if (invisible_elements.has(attribute.parent.name)) {
			// aria-unsupported-elements
			attribute.parent.component.warn(attribute, {
				code: `a11y-misplaced-role`,
				message: `A11y: <${attribute.parent.name}> should not have role attribute`,
			});
		}
	}
}

const aria_roles = 'alert alertdialog application article banner button cell checkbox columnheader combobox command complementary composite contentinfo definition dialog directory document feed figure form grid gridcell group heading img input landmark link list listbox listitem log main marquee math menu menubar menuitem menuitemcheckbox menuitemradio navigation none note option presentation progressbar radio radiogroup range region roletype row rowgroup rowheader scrollbar search searchbox section sectionhead select separator slider spinbutton status structure switch tab table tablist tabpanel term textbox timer toolbar tooltip tree treegrid treeitem widget window'.split(
	' '
);
const aria_role_set = new Set(aria_roles);
function no_unknown_role(attribute: Attribute, name: string) {
	if (name === 'role') {
		const value = attribute.get_static_value();
		// @ts-ignore
		if (value && !aria_role_set.has(value)) {
			// @ts-ignore
			const match = fuzzymatch(value, aria_roles);
			let message = `A11y: Unknown role '${value}'`;
			if (match) message += ` (did you mean '${match}'?)`;

			attribute.parent.component.warn(attribute, {
				code: `a11y-unknown-role`,
				message,
			});
		}
	}
}

function no_access_key(attribute: Attribute, name: string) {
	// no-access-key
	if (name === 'accesskey') {
		attribute.parent.component.warn(attribute, {
			code: `a11y-accesskey`,
			message: `A11y: Avoid using accesskey`,
		});
	}
}

function no_misplaced_scope(attribute: Attribute, name: string) {
	if (
		name === 'scope' &&
		attribute.parent.type === 'Element' &&
		attribute.parent.name !== 'th'
	) {
		attribute.parent.component.warn(attribute, {
			code: `a11y-misplaced-scope`,
			message: `A11y: The scope attribute should only be used with <th> elements`,
		});
	}
}

function tabindex_no_positive(attribute: Attribute, name: string) {
	// tabindex-no-positive
	if (name === 'tabindex') {
		const value = attribute.get_static_value();
		// @ts-ignore todo is tabindex=true correct case?
		if (!isNaN(value) && +value > 0) {
			attribute.parent.component.warn(attribute, {
				code: `a11y-positive-tabindex`,
				message: `A11y: avoid tabindex values above zero`,
			});
		}
	}
}

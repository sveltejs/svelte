import Attribute from '../../nodes/Attribute';
import fuzzymatch from '../../../utils/fuzzymatch';
import { array_to_string } from './utils';
import { aria } from 'aria-query';

const validators = [
	no_auto_focus,
	unsupported_aria_element,
	invalid_aria_attribute,
	no_aria_hidden,
	no_misplaced_role,
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

for (const aria_key of aria.keys()) {
	if (aria.get(aria_key).values) {
		aria.get(aria_key).values = new Set(aria.get(aria_key).values.map(String));
	}
}
const aria_attributes = [...aria.keys()];
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
				const { type: permitted_type, values: permitted_values } = aria.get(
					name
				);
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

import Attribute from '../../nodes/Attribute';
import fuzzymatch from '../../../utils/fuzzymatch';

const validators = [
	no_auto_focus,
	unsupported_aria_element,
	unknown_aria_attribute,
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

const aria_attributes = 'activedescendant atomic autocomplete busy checked colindex controls current describedby details disabled dropeffect errormessage expanded flowto grabbed haspopup hidden invalid keyshortcuts label labelledby level live modal multiline multiselectable orientation owns placeholder posinset pressed readonly relevant required roledescription rowindex selected setsize sort valuemax valuemin valuenow valuetext'.split(
	' '
);
const aria_attribute_set = new Set(aria_attributes);
function unknown_aria_attribute(attribute: Attribute, name: string) {
	if (name.startsWith('aria-')) {
		const type = name.slice(5);
		if (!aria_attribute_set.has(type)) {
			const match = fuzzymatch(type, aria_attributes);
			let message = `A11y: Unknown aria attribute 'aria-${type}'`;
			if (match) message += ` (did you mean '${match}'?)`;

			attribute.parent.component.warn(attribute, {
				code: `a11y-unknown-aria-attribute`,
				message,
			});
		}
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

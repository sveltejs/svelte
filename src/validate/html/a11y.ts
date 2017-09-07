import * as namespaces from '../../utils/namespaces';
import getStaticAttributeValue from '../../utils/getStaticAttributeValue';
import fuzzymatch from '../utils/fuzzymatch';
import validateEventHandler from './validateEventHandler';
import { Validator } from '../index';
import { Node } from '../../interfaces';

const ariaAttributes = 'activedescendant atomic autocomplete busy checked controls describedby disabled dropeffect expanded flowto grabbed haspopup hidden invalid label labelledby level live multiline multiselectable orientation owns posinset pressed readonly relevant required selected setsize sort valuemax valuemin valuenow valuetext'.split(' ');
const ariaAttributeSet = new Set(ariaAttributes);

const ariaRoles = 'alert alertdialog application article banner button checkbox columnheader combobox command complementary composite contentinfo definition dialog directory document form grid gridcell group heading img input landmark link list listbox listitem log main marquee math menu menubar menuitem menuitemcheckbox menuitemradio navigation note option presentation progressbar radio radiogroup range region roletype row rowgroup rowheader scrollbar search section sectionhead select separator slider spinbutton status structure tab tablist tabpanel textbox timer toolbar tooltip tree treegrid treeitem widget window'.split(' ');
const ariaRoleSet = new Set(ariaRoles);

const invisibleElements = new Set(['meta', 'html', 'script', 'style']);

export default function a11y(
	validator: Validator,
	node: Node,
	elementStack: Node[]
) {
	if (node.type === 'Text') {
		// accessible-emoji
		return;
	}

	if (node.type !== 'Element') return;

	const attributeMap = new Map();
	node.attributes.forEach((attribute: Node) => {
		const name = attribute.name.toLowerCase();

		// aria-props
		if (name.startsWith('aria-')) {
			if (invisibleElements.has(node.name)) {
				// aria-unsupported-elements
				validator.warn(`A11y: <${node.name}> should not have aria-* attributes`, attribute.start);
			}

			const type = name.slice(5);
			if (!ariaAttributeSet.has(type)) {
				const match = fuzzymatch(type, ariaAttributes);
				let message = `A11y: Unknown aria attribute 'aria-${type}'`;
				if (match) message += ` (did you mean '${match}'?)`;

				validator.warn(message, attribute.start);
			}
		}

		// aria-role
		if (name === 'role') {
			if (invisibleElements.has(node.name)) {
				// aria-unsupported-elements
				validator.warn(`A11y: <${node.name}> should not have role attribute`, attribute.start);
			}

			const value = getStaticAttributeValue(node, 'role');
			if (value && !ariaRoleSet.has(value)) {
				const match = fuzzymatch(value, ariaRoles);
				let message = `A11y: Unknown role '${value}'`;
				if (match) message += ` (did you mean '${match}'?)`;

				validator.warn(message, attribute.start);
			}
		}

		// no-access-key
		if (name === 'accesskey') {
			validator.warn(`A11y: Avoid using accesskey`, attribute.start);
		}

		// no-autofocus
		if (name === 'autofocus') {
			validator.warn(`A11y: Avoid using autofocus`, attribute.start);
		}

		// scope
		if (name === 'scope' && node.name !== 'th') {
			validator.warn(`A11y: The scope attribute should only be used with <th> elements`, attribute.start);
		}

		// tabindex-no-positive
		if (name === 'tabindex') {
			const value = getStaticAttributeValue(node, 'tabindex');
			if (!isNaN(value) && +value > 0) {
				validator.warn(`A11y: avoid tabindex values above zero`, attribute.start);
			}
		}

		attributeMap.set(attribute.name, attribute);
	});

	function shouldHaveAttribute(attributes: string[], name = node.name) {
		if (attributes.length === 0 || !attributes.some((name: string) => attributeMap.has(name))) {
			const article = /^[aeiou]/.test(attributes[0]) ? 'an' : 'a';
			const sequence = attributes.length > 1 ?
				attributes.slice(0, -1).join(', ') + ` or ${attributes[attributes.length - 1]}` :
				attributes[0];

			validator.warn(`A11y: <${name}> element should have ${article} ${sequence} attribute`, node.start);
		}
	}

	function shouldHaveContent() {
		if (node.children.length === 0) {
			validator.warn(`A11y: <${node.name}> element should have child content`, node.start);
		}
	}

	if (node.name === 'a') {
		// anchor-is-valid
		const href = attributeMap.get('href');
		if (attributeMap.has('href')) {
			const value = getStaticAttributeValue(node, 'href');
			if (value === '' || value === '#') {
				validator.warn(`A11y: '${value}' is not a valid href attribute`, href.start);
			}
		} else {
			validator.warn(`A11y: <a> element should have an href attribute`, node.start);
		}

		// anchor-has-content
		shouldHaveContent();
	}

	if (node.name === 'img') shouldHaveAttribute(['alt']);
	if (node.name === 'area') shouldHaveAttribute(['alt', 'aria-label', 'aria-labelledby']);
	if (node.name === 'object') shouldHaveAttribute(['title', 'aria-label', 'aria-labelledby']);
	if (node.name === 'input' && getStaticAttributeValue(node, 'type') === 'image') {
		shouldHaveAttribute(['alt', 'aria-label', 'aria-labelledby'], 'input type="image"');
	}

	// heading-has-content
	if (/^h[1-6]$/.test(node.name)) {
		shouldHaveContent();

		if (attributeMap.has('aria-hidden')) {
			validator.warn(`A11y: <${node.name}> element should not be hidden`, attributeMap.get('aria-hidden').start);
		}
	}

	// iframe-has-title
	if (node.name === 'iframe') {
		shouldHaveAttribute(['title']);
	}

	// html-has-lang
	if (node.name === 'html') {
		shouldHaveAttribute(['lang']);
	}

	// no-distracting-elements
	if (node.name === 'marquee' || node.name === 'blink') {
		validator.warn(`A11y: Avoid <${node.name}> elements`, node.start);
	}

	if (node.name === 'figcaption') {
		const parent = elementStack[elementStack.length - 1];
		if (parent) {
			if (parent.name !== 'figure') {
				validator.warn(`A11y: <figcaption> must be an immediate child of <figure>`, node.start);
			} else {
				const index = parent.children.indexOf(node);
				if (index !== 0 && index !== parent.children.length - 1) {
					validator.warn(`A11y: <figcaption> must be first or last child of <figure>`, node.start);
				}
			}
		}
	}
}

function getValue(attribute: Node) {
	if (attribute.value.length === 0) return '';
	if (attribute.value.length === 1 && attribute.value[0].type === 'Text') return attribute.value[0].data;

	return null;
}

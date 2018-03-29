import * as namespaces from '../../utils/namespaces';
import getStaticAttributeValue from '../../utils/getStaticAttributeValue';
import fuzzymatch from '../utils/fuzzymatch';
import validateEventHandler from './validateEventHandler';
import { Validator } from '../index';
import { Node } from '../../interfaces';

const ariaAttributes = 'activedescendant atomic autocomplete busy checked controls current describedby disabled dropeffect expanded flowto grabbed haspopup hidden invalid label labelledby level live multiline multiselectable orientation owns posinset pressed readonly relevant required selected setsize sort valuemax valuemin valuenow valuetext'.split(' ');
const ariaAttributeSet = new Set(ariaAttributes);

const ariaRoles = 'alert alertdialog application article banner button checkbox columnheader combobox command complementary composite contentinfo definition dialog directory document feed form grid gridcell group heading img input landmark link list listbox listitem log main marquee math menu menubar menuitem menuitemcheckbox menuitemradio navigation note option presentation progressbar radio radiogroup range region roletype row rowgroup rowheader scrollbar search section sectionhead select separator slider spinbutton status structure tab tablist tabpanel textbox timer toolbar tooltip tree treegrid treeitem widget window'.split(' ');
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
		if (attribute.type === 'Spread') return;

		const name = attribute.name.toLowerCase();

		// aria-props
		if (name.startsWith('aria-')) {
			if (invisibleElements.has(node.name)) {
				// aria-unsupported-elements
				validator.warn(`A11y: <${node.name}> should not have aria-* attributes`, attribute);
			}

			const type = name.slice(5);
			if (!ariaAttributeSet.has(type)) {
				const match = fuzzymatch(type, ariaAttributes);
				let message = `A11y: Unknown aria attribute 'aria-${type}'`;
				if (match) message += ` (did you mean '${match}'?)`;

				validator.warn(message, attribute);
			}
		}

		// aria-role
		if (name === 'role') {
			if (invisibleElements.has(node.name)) {
				// aria-unsupported-elements
				validator.warn(`A11y: <${node.name}> should not have role attribute`, attribute);
			}

			const value = getStaticAttributeValue(node, 'role');
			if (value && !ariaRoleSet.has(value)) {
				const match = fuzzymatch(value, ariaRoles);
				let message = `A11y: Unknown role '${value}'`;
				if (match) message += ` (did you mean '${match}'?)`;

				validator.warn(message, attribute);
			}
		}

		// no-access-key
		if (name === 'accesskey') {
			validator.warn(`A11y: Avoid using accesskey`, attribute);
		}

		// no-autofocus
		if (name === 'autofocus') {
			validator.warn(`A11y: Avoid using autofocus`, attribute);
		}

		// scope
		if (name === 'scope' && node.name !== 'th') {
			validator.warn(`A11y: The scope attribute should only be used with <th> elements`, attribute);
		}

		// tabindex-no-positive
		if (name === 'tabindex') {
			const value = getStaticAttributeValue(node, 'tabindex');
			if (!isNaN(value) && +value > 0) {
				validator.warn(`A11y: avoid tabindex values above zero`, attribute);
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

			validator.warn(`A11y: <${name}> element should have ${article} ${sequence} attribute`, node);
		}
	}

	function shouldHaveContent() {
		if (node.children.length === 0) {
			validator.warn(`A11y: <${node.name}> element should have child content`, node);
		}
	}

	function shouldHaveValidHref (attribute) {
		const href = attributeMap.get(attribute);
		const value = getStaticAttributeValue(node, attribute);
		if (value === '' || value === '#') {
			validator.warn(`A11y: '${value}' is not a valid ${attribute} attribute`, href);
		}
	}

	if (node.name === 'a') {
		if (attributeMap.has('href')) {
			// anchor-is-valid
			shouldHaveValidHref('href')
		} else if (attributeMap.has('xlink:href')) {
			// anchor-in-svg-is-valid
			shouldHaveValidHref('xlink:href')
		} else {
			validator.warn(`A11y: <a> element should have an href attribute`, node);
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
			validator.warn(`A11y: <${node.name}> element should not be hidden`, attributeMap.get('aria-hidden'));
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
		validator.warn(`A11y: Avoid <${node.name}> elements`, node);
	}

	if (node.name === 'figcaption') {
		const parent = elementStack[elementStack.length - 1];
		if (parent) {
			if (parent.name !== 'figure') {
				validator.warn(`A11y: <figcaption> must be an immediate child of <figure>`, node);
			} else {
				const children = parent.children.filter(node => {
					if (node.type === 'Comment') return false;
					if (node.type === 'Text') return /\S/.test(node.data);
					return true;
				});

				const index = children.indexOf(node);

				if (index !== 0 && index !== children.length - 1) {
					validator.warn(`A11y: <figcaption> must be first or last child of <figure>`, node);
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

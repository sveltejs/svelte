import * as namespaces from '../../utils/namespaces';
import getStaticAttributeValue from '../../utils/getStaticAttributeValue';
import fuzzymatch from '../utils/fuzzymatch';
import validateEventHandler from './validateEventHandler';
import { Validator } from '../index';
import { Node } from '../../interfaces';

const ariaAttributes = 'activedescendant atomic autocomplete busy checked controls describedby disabled dropeffect expanded flowto grabbed haspopup hidden invalid label labelledby level live multiline multiselectable orientation owns posinset pressed readonly relevant required selected setsize sort valuemax valuemin valuenow valuetext'.split(' ');
const ariaSet = new Set(ariaAttributes);

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
		if (attribute.name.startsWith('aria-')) {
			const name = attribute.name.slice(5);
			if (!ariaSet.has(name)) {
				const match = fuzzymatch(name, ariaAttributes);
				let message = `A11y: Unknown aria attribute 'aria-${name}'`;
				if (match) message += ` (did you mean '${match}'?)`;

				validator.warn(message, attribute.start);
			}
		}

		attributeMap.set(attribute.name, attribute);
	});

	function shouldHaveOneOf(attributes: string[], name = node.name) {
		if (attributes.length === 0 || !attributes.some((name: string) => attributeMap.has(name))) {
			const article = /^[aeiou]/.test(attributes[0]) ? 'an' : 'a';
			const sequence = attributes.length > 1 ?
				attributes.slice(0, -1).join(', ') + ` or ${attributes[attributes.length - 1]}` :
				attributes[0];

			validator.warn(`A11y: <${name}> element should have ${article} ${sequence} attribute`, node.start);
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
		if (node.children.length === 0) {
			validator.warn(`A11y: <a> element should have child content`, node.start);
		}
	}

	if (node.name === 'img') shouldHaveOneOf(['alt']);
	if (node.name === 'area') shouldHaveOneOf(['alt', 'aria-label', 'aria-labelledby']);
	if (node.name === 'object') shouldHaveOneOf(['title', 'aria-label', 'aria-labelledby']);
	if (node.name === 'input' && getStaticAttributeValue(node, 'type') === 'image') {
		shouldHaveOneOf(['alt', 'aria-label', 'aria-labelledby'], 'input type="image"');
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
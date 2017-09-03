import * as namespaces from '../../utils/namespaces';
import validateEventHandler from './validateEventHandler';
import { Validator } from '../index';
import { Node } from '../../interfaces';

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
		attributeMap.set(attribute.name, attribute);
	});

	if (node.name === 'a') {
		// anchor-is-valid
		const href = attributeMap.get('href');
		if (href) {
			const value = getValue(href);
			if (value === '' || value === '#') {
				validator.warn(`A11y: '${value}' is not a valid href attribute`, href.start);
			}
		} else {
			validator.warn(`A11y: <a> element should have an href attribute`, node.start);
		}

		// anchor-has-content
		if (!node.children.length) {
			validator.warn(`A11y: <a> element should have child content`, node.start);
		}
	}

	if (node.name === 'img' && !attributeMap.has('alt')) {
		validator.warn(`A11y: <img> element should have an alt attribute`, node.start);
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
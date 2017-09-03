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
		if (!attributeMap.has('href')) {
			validator.warn(`A11y: <a> element should have an href attribute`, node.start);
		}

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
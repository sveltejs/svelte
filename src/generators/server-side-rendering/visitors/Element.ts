import visitComponent from './Component';
import visitSlot from './Slot';
import isVoidElementName from '../../../utils/isVoidElementName';
import visit from '../visit';
import { SsrGenerator } from '../index';
import Element from '../../nodes/Element';
import Block from '../Block';
import { Node } from '../../../interfaces';
import stringifyAttributeValue from './shared/stringifyAttributeValue';

export default function visitElement(
	generator: SsrGenerator,
	block: Block,
	node: Element
) {
	if (node.name === 'slot') {
		visitSlot(generator, block, node);
		return;
	}

	let openingTag = `<${node.name}`;
	let textareaContents; // awkward special case

	const slot = node.getStaticAttributeValue('slot');
	if (slot && node.hasAncestor('Component')) {
		const slot = node.attributes.find((attribute: Node) => attribute.name === 'slot');
		const slotName = slot.value[0].data;
		const appendTarget = generator.appendTargets[generator.appendTargets.length - 1];
		appendTarget.slotStack.push(slotName);
		appendTarget.slots[slotName] = '';
	}

	node.attributes.forEach((attribute: Node) => {
		if (attribute.type !== 'Attribute') return;

		if (attribute.name === 'value' && node.name === 'textarea') {
			textareaContents = stringifyAttributeValue(block, attribute.value);
		} else {
			let str = ` ${attribute.name}`;

			if (attribute.value !== true) {
				str += `="${stringifyAttributeValue(block, attribute.value)}"`;
			}

			openingTag += str;
		}
	});

	if (node._needsCssAttribute) {
		openingTag += ` ${generator.stylesheet.id}`;

		if (node._cssRefAttribute) {
			openingTag += ` svelte-ref-${node._cssRefAttribute}`;
		}
	}

	openingTag += '>';

	generator.append(openingTag);

	if (node.name === 'textarea' && textareaContents !== undefined) {
		generator.append(textareaContents);
	} else if (node.name === 'script' || node.name === 'style') {
		generator.append(node.data);
	} else {
		node.children.forEach((child: Node) => {
			visit(generator, block, child);
		});
	}

	if (!isVoidElementName(node.name)) {
		generator.append(`</${node.name}>`);
	}
}

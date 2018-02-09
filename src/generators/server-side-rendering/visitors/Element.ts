import visitComponent from './Component';
import visitSlot from './Slot';
import isVoidElementName from '../../../utils/isVoidElementName';
import visit from '../visit';
import { SsrGenerator } from '../index';
import Element from '../../nodes/Element';
import Block from '../Block';
import { Node } from '../../../interfaces';
import stringifyAttributeValue from './shared/stringifyAttributeValue';
import { escape } from '../../../utils/stringify';

// source: https://gist.github.com/ArjanSchouten/0b8574a6ad7f5065a5e7
const booleanAttributes = new Set('async autocomplete autofocus autoplay border challenge checked compact contenteditable controls default defer disabled formnovalidate frameborder hidden indeterminate ismap loop multiple muted nohref noresize noshade novalidate nowrap open readonly required reversed scoped scrolling seamless selected sortable spellcheck translate'.split(' '));

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
		} else if (attribute.value === true) {
			openingTag += ` ${attribute.name}`;
		} else if (
			booleanAttributes.has(attribute.name) &&
			attribute.value.length === 1 &&
			attribute.value[0].type !== 'Text'
		) {
			// a boolean attribute with one non-Text chunk
			block.contextualise(attribute.value[0].expression);
			openingTag += '${' + attribute.value[0].metadata.snippet + ' ? " ' + attribute.name + '" : "" }';
		} else {
			openingTag += ` ${attribute.name}="${stringifyAttributeValue(block, attribute.value)}"`;
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
	} else {
		node.children.forEach((child: Node) => {
			visit(generator, block, child);
		});
	}

	if (!isVoidElementName(node.name)) {
		generator.append(`</${node.name}>`);
	}
}

import visitComponent from './Component';
import visitSlot from './Slot';
import isVoidElementName from '../../../utils/isVoidElementName';
import quoteIfNecessary from '../../../utils/quoteIfNecessary';
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
		const slotName = slot.chunks[0].data;
		const appendTarget = generator.appendTargets[generator.appendTargets.length - 1];
		appendTarget.slotStack.push(slotName);
		appendTarget.slots[slotName] = '';
	}

	if (node.attributes.find(attr => attr.isSpread)) {
		// TODO dry this out
		const args = [];
		node.attributes.forEach(attribute => {
			if (attribute.isSpread) {
				args.push(attribute.expression.snippet);
			} else {
				if (attribute.name === 'value' && node.name === 'textarea') {
					textareaContents = stringifyAttributeValue(block, attribute.chunks);
				} else if (attribute.isTrue) {
					args.push(`{ ${quoteIfNecessary(attribute.name)}: true }`);
				} else if (
					booleanAttributes.has(attribute.name) &&
					attribute.chunks.length === 1 &&
					attribute.chunks[0].type !== 'Text'
				) {
					// a boolean attribute with one non-Text chunk
					args.push(`{ ${quoteIfNecessary(attribute.name)}: ${attribute.chunks[0].snippet} }`);
				} else {
					args.push(`{ ${quoteIfNecessary(attribute.name)}: \`${stringifyAttributeValue(block, attribute.chunks)}\` }`);
				}
			}
		});

		openingTag += "${__spread([" + args.join(', ') + "])}";
	} else {
		node.attributes.forEach((attribute: Node) => {
			if (attribute.type !== 'Attribute') return;

			if (attribute.name === 'value' && node.name === 'textarea') {
				textareaContents = stringifyAttributeValue(block, attribute.value);
			} else if (attribute.isTrue) {
				openingTag += ` ${attribute.name}`;
			} else if (
				booleanAttributes.has(attribute.name) &&
				attribute.chunks.length === 1 &&
				attribute.chunks[0].type !== 'Text'
			) {
				// a boolean attribute with one non-Text chunk
				openingTag += '${' + attribute.chunks[0].snippet + ' ? " ' + attribute.name + '" : "" }';
			} else {
				openingTag += ` ${attribute.name}="${stringifyAttributeValue(block, attribute.chunks)}"`;
			}
		});
	}

	if (node._cssRefAttribute) {
		openingTag += ` svelte-ref-${node._cssRefAttribute}`;
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

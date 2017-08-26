import visitComponent from './Component';
import visitSlot from './Slot';
import isVoidElementName from '../../../utils/isVoidElementName';
import visit from '../visit';
import visitWindow from './meta/Window';
import { SsrGenerator } from '../index';
import Block from '../Block';
import { escape } from '../../../utils/stringify';
import { Node } from '../../../interfaces';

const meta = {
	':Window': visitWindow,
};

function stringifyAttributeValue(block: Block, chunks: Node[]) {
	return chunks
		.map((chunk: Node) => {
			if (chunk.type === 'Text') {
				return escape(chunk.data).replace(/"/g, '&quot;');
			}

			const { snippet } = block.contextualise(chunk.expression);
			return '${' + snippet + '}';
		})
		.join('');
}

export default function visitElement(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	if (node.name in meta) {
		return meta[node.name](generator, block, node);
	}

	if (node.name === 'slot') {
		visitSlot(generator, block, node);
		return;
	}

	if (generator.components.has(node.name) || node.name === ':Self') {
		visitComponent(generator, block, node);
		return;
	}

	let openingTag = `<${node.name}`;
	let textareaContents; // awkward special case

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
	} else {
		generator.elementDepth += 1;

		node.children.forEach((child: Node) => {
			visit(generator, block, child);
		});

		generator.elementDepth -= 1;
	}

	if (!isVoidElementName(node.name)) {
		generator.append(`</${node.name}>`);
	}
}

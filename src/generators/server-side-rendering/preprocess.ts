import getStaticAttributeValue from '../../utils/getStaticAttributeValue';
import isChildOfComponent from '../shared/utils/isChildOfComponent';
import { SsrGenerator } from './index';
import { Node } from '../../interfaces';

function noop () {}

const preprocessors = {
	MustacheTag: noop,
	RawMustacheTag: noop,
	Text: noop,

	AwaitBlock: (
		generator: SsrGenerator,
		node: Node,
		elementStack: Node[]
	) => {
		preprocessChildren(generator, node.pending, elementStack);
		preprocessChildren(generator, node.then, elementStack);
		preprocessChildren(generator, node.catch, elementStack);
	},

	IfBlock: (
		generator: SsrGenerator,
		node: Node,
		elementStack: Node[]
	) => {
		preprocessChildren(generator, node, elementStack);

		if (node.else) {
			preprocessChildren(
				generator,
				node.else,
				elementStack
			);
		}
	},

	EachBlock: (
		generator: SsrGenerator,
		node: Node,
		elementStack: Node[]
	) => {
		preprocessChildren(generator, node, elementStack);

		if (node.else) {
			preprocessChildren(
				generator,
				node.else,
				elementStack
			);
		}
	},

	Element: (
		generator: SsrGenerator,
		node: Node,
		elementStack: Node[]
	) => {
		const isComponent =
			generator.components.has(node.name) || node.name === ':Self';

		if (!isComponent) {
			generator.stylesheet.apply(node, elementStack);

			const slot = getStaticAttributeValue(node, 'slot');
			if (slot && isChildOfComponent(node, generator)) {
				node.slotted = true;
			}

			// Treat these the same way:
			//   <option>{{foo}}</option>
			//   <option value='{{foo}}'>{{foo}}</option>
			const valueAttribute = node.attributes.find((attribute: Node) => attribute.name === 'value');

			if (node.name === 'option' && !valueAttribute) {
				node.attributes.push({
					type: 'Attribute',
					name: 'value',
					value: node.children
				});
			}
		}

		if (node.children.length) {
			if (isComponent) {
				preprocessChildren(generator, node, elementStack);
			} else {
				preprocessChildren(generator, node, elementStack.concat(node));
			}
		}
	},
};

function preprocessChildren(
	generator: SsrGenerator,
	node: Node,
	elementStack: Node[]
) {
	node.children.forEach((child: Node, i: number) => {
		child.parent = node;

		const preprocessor = preprocessors[child.type];
		if (preprocessor) preprocessor(generator, child, elementStack);
	});
}

export default function preprocess(generator: SsrGenerator, html: Node) {
	preprocessChildren(generator, html, []);
}
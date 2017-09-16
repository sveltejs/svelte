import getStaticAttributeValue from '../../utils/getStaticAttributeValue';
import isChildOfComponent from '../shared/utils/isChildOfComponent';
import { SsrGenerator } from './index';
import { Node } from '../../interfaces';

function noop () {}

function isElseIf(node: Node) {
	return (
		node && node.children.length === 1 && node.children[0].type === 'IfBlock'
	);
}

const preprocessors = {
	MustacheTag: noop,
	RawMustacheTag: noop,
	Text: noop,

	IfBlock: (
		generator: SsrGenerator,
		node: Node,
		elementStack: Node[]
	) => {
		function attachBlocks(node: Node) {
			preprocessChildren(generator, node, elementStack);

			if (isElseIf(node.else)) {
				attachBlocks(node.else.children[0]);
			} else if (node.else) {
				preprocessChildren(
					generator,
					node.else,
					elementStack
				);
			}
		}

		attachBlocks(node);
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
import { stringify } from '../../utils/stringify';
import Node from './shared/Node';
import Block from '../dom/Block';

// Whitespace inside one of these elements will not result in
// a whitespace node being created in any circumstances. (This
// list is almost certainly very incomplete)
const elementsWithoutText = new Set([
	'audio',
	'datalist',
	'dl',
	'ol',
	'optgroup',
	'select',
	'ul',
	'video',
]);

function shouldSkip(node: Text) {
	if (/\S/.test(node.data)) return false;

	const parentElement = node.findNearest(/(?:Element|Component)/);
	if (!parentElement) return false;

	if (parentElement.type === 'Component') return parentElement.children.length === 1 && node === parentElement.children[0];

	return parentElement.namespace || elementsWithoutText.has(parentElement.name);
}

export default class Text extends Node {
	type: 'Text';
	data: string;
	shouldSkip: boolean;

	init(block: Block) {
		const parentElement = this.findNearest(/(?:Element|Component)/);

		if (shouldSkip(this)) {
			this.shouldSkip = true;
			return;
		}

		this.var = block.getUniqueName(`text`);
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		if (this.shouldSkip) return;

		block.addElement(
			this.var,
			`@createText(${stringify(this.data)})`,
			`@claimText(${parentNodes}, ${stringify(this.data)})`,
			parentNode
		);
	}
}
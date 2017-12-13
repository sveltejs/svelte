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

export default class Text extends Node {
	type: 'Text';
	data: string;
	shouldSkip: boolean;

	init(block: Block) {
		const parentElement = this.findNearest('Element');

		if (!/\S/.test(this.data) && parentElement && (parentElement.namespace || elementsWithoutText.has(parentElement.name))) {
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
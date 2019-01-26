import Renderer from '../Renderer';
import Block from '../Block';
import Text from '../../nodes/Text';
import Wrapper from './shared/Wrapper';
import { CompileOptions } from '../../../interfaces';
import { stringify } from '../../../utils/stringify';

// Whitespace inside one of these elements will not result in
// a whitespace node being created in any circumstances. (This
// list is almost certainly very incomplete)
const elementsWithoutText = new Set([
	'audio',
	'datalist',
	'dl',
	'optgroup',
	'select',
	'video',
]);

// TODO this should probably be in Fragment
function shouldSkip(node: Text) {
	if (/\S/.test(node.data)) return false;

	const parentElement = node.findNearest(/(?:Element|InlineComponent|Head)/);
	if (!parentElement) return false;

	if (parentElement.type === 'Head') return true;
	if (parentElement.type === 'InlineComponent') return parentElement.children.length === 1 && node === parentElement.children[0];

	return parentElement.namespace || elementsWithoutText.has(parentElement.name);
}

export default class TextWrapper extends Wrapper {
	node: Text;
	data: string;
	skip: boolean;
	var: string;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: Text,
		data: string
	) {
		super(renderer, block, parent, node);

		this.skip = shouldSkip(this.node);
		this.data = data;
		this.var = this.skip ? null : 'text';
	}

	render(block: Block, parentNode: string, parentNodes: string) {
		if (this.skip) return;

		block.addElement(
			this.var,
			`@createText(${stringify(this.data)})`,
			parentNodes && `@claimText(${parentNodes}, ${stringify(this.data)})`,
			parentNode
		);
	}
}
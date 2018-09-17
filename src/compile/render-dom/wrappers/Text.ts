import Renderer from '../Renderer';
import Block from '../Block';
import Text from '../../nodes/Text';
import Wrapper from './shared/wrapper';
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
	var: string;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: Text
	) {
		super(renderer, block, parent, node);
		this.var = 'text';
	}

	render(block: Block, parentNode: string, parentNodes: string) {
		block.addElement(
			this.var,
			`@createText(${stringify(this.node.data)})`,
			parentNodes && `@claimText(${parentNodes}, ${stringify(this.node.data)})`,
			parentNode
		);
	}

	remount(name: string) {
		return `@append(${name}._slotted.default, ${this.var});`;
	}
}
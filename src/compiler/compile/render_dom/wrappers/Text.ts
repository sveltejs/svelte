import Renderer from '../Renderer';
import Block from '../Block';
import Text from '../../nodes/Text';
import Wrapper from './shared/Wrapper';
import { stringify } from '../../utils/stringify';

// Whitespace inside one of these elements will not result in
// a whitespace node being created in any circumstances. (This
// list is almost certainly very incomplete)
const elements_without_text = new Set([
	'audio',
	'datalist',
	'dl',
	'optgroup',
	'select',
	'video',
]);

// TODO this should probably be in Fragment
function should_skip(node: Text) {
	if (/\S/.test(node.data)) return false;

	const parent_element = node.find_nearest(/(?:Element|InlineComponent|Head)/);
	if (!parent_element) return false;

	if (parent_element.type === 'Head') return true;
	if (parent_element.type === 'InlineComponent') return parent_element.children.length === 1 && node === parent_element.children[0];

	return parent_element.namespace || elements_without_text.has(parent_element.name);
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

		this.skip = should_skip(this.node);
		this.data = data;
		this.var = this.skip ? null : 't';
	}

	use_space() {
		if (this.renderer.component.component_options.preserveWhitespace) return false;
		if (/[\S\u00A0]/.test(this.data)) return false;

		let node = this.parent && this.parent.node;
		while (node) {
			if (node.type === 'Element' && node.name === 'pre') {
				return false;
			}
			node = node.parent;
		}

		return true;
	}

	render(block: Block, parent_node: string, parent_nodes: string) {
		if (this.skip) return;

		block.add_element(
			this.var,
			this.use_space() ? `@space()` : `@text(${stringify(this.data)})`,
			parent_nodes && `@claim_text(${parent_nodes}, ${stringify(this.data)})`,
			parent_node
		);
	}
}
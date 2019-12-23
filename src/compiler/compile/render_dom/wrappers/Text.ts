import Renderer from '../Renderer';
import Block from '../Block';
import Text from '../../nodes/Text';
import Wrapper from './shared/Wrapper';
import { x } from 'code-red';
import { Identifier } from 'estree';

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

	// svg namespace exclusions
	if (/svg$/.test(parent_element.namespace)) {
		if (node.prev && node.prev.type === "Element" && node.prev.name === "tspan") return false;
	}

	return parent_element.namespace || elements_without_text.has(parent_element.name);
}

export default class TextWrapper extends Wrapper {
	node: Text;
	data: string;
	skip: boolean;
	var: Identifier;

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
		this.var = (this.skip ? null : x`t`) as unknown as Identifier;
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

	render(block: Block, parent_node: Identifier, parent_nodes: Identifier) {
		if (this.skip) return;
		const use_space = this.use_space();

		block.add_element(
			this.var,
			use_space ? x`@space()` : x`@text("${this.data}")`,
			parent_nodes && (use_space ? x`@claim_space(${parent_nodes})` : x`@claim_text(${parent_nodes}, "${this.data}")`),
			parent_node as Identifier
		);
	}
}
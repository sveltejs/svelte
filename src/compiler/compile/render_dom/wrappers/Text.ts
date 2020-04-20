import Renderer from '../Renderer';
import Block from '../Block';
import Text from '../../nodes/Text';
import Wrapper from './shared/Wrapper';
import { x } from 'code-red';
import { Identifier } from 'estree';

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

		this.skip = this.node.should_skip();
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
import Renderer from '../Renderer';
import Block from '../Block';
import Node from '../../nodes/shared/Node';
import Tag from './shared/Tag';
import Wrapper from './shared/Wrapper';

export default class MustacheTagWrapper extends Tag {
	var = 't';

	constructor(renderer: Renderer, block: Block, parent: Wrapper, node: Node) {
		super(renderer, block, parent, node);
		this.cannot_use_innerhtml();
	}

	render(block: Block, parent_node: string, parent_nodes: string) {
		const { init } = this.rename_this_method(
			block,
			value => `@set_data(${this.var}, ${value});`
		);

		block.add_element(
			this.var,
			`@text(${init})`,
			parent_nodes && `@claim_text(${parent_nodes}, ${init})`,
			parent_node
		);
	}
}
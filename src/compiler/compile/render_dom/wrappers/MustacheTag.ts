import Renderer from '../Renderer.ts';
import Block from '../Block.ts';
import Tag from './shared/Tag.ts';
import Wrapper from './shared/Wrapper.ts';
import MustacheTag from '../../nodes/MustacheTag.ts';
import RawMustacheTag from '../../nodes/RawMustacheTag.ts';
import { x } from 'code-red';
import { Identifier } from 'estree';

export default class MustacheTagWrapper extends Tag {
	var: Identifier = { type: 'Identifier', name: 't' };

	constructor(renderer: Renderer, block: Block, parent: Wrapper, node: MustacheTag | RawMustacheTag) {
		super(renderer, block, parent, node);
	}

	render(block: Block, parent_node: Identifier, parent_nodes: Identifier) {
		const { init } = this.rename_this_method(
			block,
			value => x`@set_data(${this.var}, ${value})`
		);

		block.add_element(
			this.var,
			x`@text(${init})`,
			parent_nodes && x`@claim_text(${parent_nodes}, ${init})`,
			parent_node
		);
	}
}

import Renderer from '../Renderer';
import Block from '../Block';
import Comment from '../../nodes/Comment';
import Wrapper from './shared/Wrapper';
import { x } from 'code-red';
import { Identifier } from 'estree';

export default class CommentWrapper extends Wrapper {
	node: Comment;
	var: Identifier;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: Comment
	) {
		super(renderer, block, parent, node);
		this.var = x`c` as Identifier;
	}

	render(block: Block, parent_node: Identifier, parent_nodes: Identifier) {
	    if (!this.renderer.options.preserveComments) return;

		const string_literal = {
			type: 'Literal',
			value: this.node.data,
			loc: {
				start: this.renderer.locate(this.node.start),
				end: this.renderer.locate(this.node.end)
			}
		};

		block.add_element(
			this.var,
			x`@comment(${string_literal})`,
			parent_nodes && x`@claim_comment(${parent_nodes}, ${string_literal})`,
			parent_node
		);
	}
}

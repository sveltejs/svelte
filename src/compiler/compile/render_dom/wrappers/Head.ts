import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import Head from '../../nodes/Head';
import FragmentWrapper from './Fragment';
import { x } from 'code-red';
import { Identifier } from 'estree';

export default class HeadWrapper extends Wrapper {
	fragment: FragmentWrapper;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: Head,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);

		this.can_use_innerhtml = false;

		this.fragment = new FragmentWrapper(
			renderer,
			block,
			node.children,
			this,
			strip_whitespace,
			next_sibling
		);
	}

	render(block: Block, _parent_node: Identifier, _parent_nodes: Identifier) {
		this.fragment.render(block, x`@_document.head` as unknown as Identifier, x`#nodes` as unknown as Identifier);
	}
}

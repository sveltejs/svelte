import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import Head from '../../nodes/Head';
import FragmentWrapper from './Fragment';

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

	render(block: Block, parent_node: string, parent_nodes: string) {
		this.fragment.render(block, 'document.head', null);
	}
}
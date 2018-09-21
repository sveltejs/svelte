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
		stripWhitespace: boolean,
		nextSibling: Wrapper
	) {
		super(renderer, block, parent, node);

		this.fragment = new FragmentWrapper(
			renderer,
			block,
			node.children,
			parent,
			stripWhitespace,
			nextSibling
		);
	}

	render(block: Block, parentNode: string, parentNodes: string) {
		this.fragment.render(block, 'document.head', null);
	}
}
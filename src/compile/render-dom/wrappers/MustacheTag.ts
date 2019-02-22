import Renderer from '../Renderer';
import Block from '../Block';
import Node from '../../nodes/shared/Node';
import Tag from './shared/Tag';
import Wrapper from './shared/Wrapper';

export default class MustacheTagWrapper extends Tag {
	var = 'text';

	constructor(renderer: Renderer, block: Block, parent: Wrapper, node: Node) {
		super(renderer, block, parent, node);
		this.cannotUseInnerHTML();
	}

	render(block: Block, parentNode: string, parentNodes: string) {
		const { init } = this.renameThisMethod(
			block,
			value => `@setData(${this.var}, ${value});`
		);

		block.addElement(
			this.var,
			`@createText(${init})`,
			parentNodes && `@claimText(${parentNodes}, ${init})`,
			parentNode
		);
	}
}
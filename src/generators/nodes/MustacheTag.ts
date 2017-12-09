import Node from './shared/Node';
import Tag from './shared/Tag';
import Block from '../dom/Block';
import State from '../dom/State';

export default class MustacheTag extends Tag {
	init(block: Block) {
		this.cannotUseInnerHTML();
		this.var = block.getUniqueName('text');
		block.addDependencies(this.metadata.dependencies);
	}

	build(
		block: Block,
		state: State,
		elementStack: Node[],
		componentStack: Node[]
	) {
		const { init } = this.renameThisMethod(
			block,
			value => `${this.var}.data = ${value};`
		);

		block.addElement(
			this.var,
			`@createText(${init})`,
			`@claimText(${state.parentNodes}, ${init})`,
			state.parentNode
		);
	}
}
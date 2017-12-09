import Node from './shared/Node';
import Block from '../dom/Block';
import State from '../dom/State';
import visitTag from '../dom/visitors/shared/Tag';

export default class MustacheTag extends Node {
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
		const { init } = visitTag(
			this.generator,
			block,
			state,
			this,
			this.var,
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
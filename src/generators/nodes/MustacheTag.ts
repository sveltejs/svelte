import Node from './shared/Node';
import Block from '../dom/Block';

export default class MustacheTag extends Node {
	init(block: Block) {
		this.cannotUseInnerHTML();
		this.var = block.getUniqueName('text');
		block.addDependencies(this.metadata.dependencies);
	}
}
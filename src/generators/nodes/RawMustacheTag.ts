import Node from './shared/Node';
import Block from '../dom/Block';

export default class RawMustacheTag extends Node {
	init(block: Block) {
		this.cannotUseInnerHTML();
		this.var = block.getUniqueName('raw');
		block.addDependencies(this.metadata.dependencies);
	}
}
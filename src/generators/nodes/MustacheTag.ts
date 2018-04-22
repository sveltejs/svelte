import Node from './shared/Node';
import Tag from './shared/Tag';
import Block from '../dom/Block';

export default class MustacheTag extends Tag {
	init(block: Block) {
		this.cannotUseInnerHTML();
		this.var = block.getUniqueName('text');
		block.addDependencies(this.expression.dependencies);
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const { init } = this.renameThisMethod(
			block,
			value => `${this.var}.data = ${value};`
		);

		block.addElement(
			this.var,
			`@createText(${init})`,
			parentNodes && `@claimText(${parentNodes}, ${init})`,
			parentNode
		);
	}

	remount(name: string) {
		return `@appendNode(${this.var}, ${name}._slotted.default);`;
	}
}
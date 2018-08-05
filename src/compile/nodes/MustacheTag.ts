import Node from './shared/Node';
import Tag from './shared/Tag';
import Block from '../dom/Block';

export default class MustacheTag extends Tag {
	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
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

	remount(name: string) {
		return `@append(${name}._slotted.default, ${this.var});`;
	}

	ssr() {
		this.compiler.target.append(
			this.parent &&
			this.parent.type === 'Element' &&
			this.parent.name === 'style'
				? '${' + this.expression.snippet + '}'
				: '${@escape(' + this.expression.snippet + ')}'
		);
	}
}
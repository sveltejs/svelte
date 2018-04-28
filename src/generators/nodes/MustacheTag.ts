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

	ssr(compiler) {
		compiler.append(
			this.parent &&
			this.parent.type === 'Element' &&
			this.parent.name === 'style'
				? '${' + this.expression.snippet + '}'
				: '${__escape(' + this.expression.snippet + ')}'
		);
	}
}
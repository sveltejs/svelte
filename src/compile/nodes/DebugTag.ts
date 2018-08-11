import Node from './shared/Node';
import Tag from './shared/Tag';
import Block from '../dom/Block';
import Expression from './shared/Expression';
import deindent from '../../utils/deindent';
import addToSet from '../../utils/addToSet';

export default class DebugTag extends Node {
	expressions: Expression[];

	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);

		this.expressions = info.identifiers.map(node => {
			return new Expression(compiler, parent, scope, node);
		});
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string,
	) {
		// Debug all
		if (this.expressions.length === 0) {
			block.builders.create.addLine('debugger;');
			block.builders.update.addLine('debugger;');
		} else {
			const dependencies = new Set();
			this.expressions.forEach(expression => {
				addToSet(dependencies, expression.dependencies);
			});

			const condition = [...dependencies].map(d => `changed.${d}`).join(' || ');

			const identifiers = this.expressions.map(e => e.node.name).join(', ');

			block.builders.update.addBlock(deindent`
				if (${condition}) {
					const { ${identifiers} } = ctx;
					console.log({ ${identifiers} });
					debugger;
				}
			`);

			block.builders.create.addBlock(deindent`
				const { ${identifiers} } = ctx;
				console.log({ ${identifiers} });
				debugger;
			`);
		}
	}
}
import Node from './shared/Node';
import Tag from './shared/Tag';
import Block from '../dom/Block';
import Expression from './shared/Expression';
import deindent from '../../utils/deindent';

export default class DebugTag extends Node {
	expression: Expression;
	
	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);
		if (info.expression !== null)
			// Debug when expression nodes change		
			this.expression = new Expression(compiler, parent, scope, info.expression);
		else
			// "Debug all"
			this.expression = info.expression
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string,
	) {
		// Debug all
		if (this.expression === null) {
			block.builders.create.addLine('debugger;');
			block.builders.update.addLine('debugger;');
		} else {
			const { dependencies } = this.expression;

			const condition = [...dependencies].map(d => `changed.${d}`).join(' || ');

			const identifiers = this.expression.node.expressions.map(e => e.name).join(', ');

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
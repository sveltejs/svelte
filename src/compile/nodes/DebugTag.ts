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
		if (!this.compiler.options.dev) return;

		const { code } = this.compiler;

		// Debug all
		if (this.expressions.length === 0) {
			code.overwrite(this.start + 1, this.start + 7, 'debugger', {
				storeName: true
			});
			const statement = `[✂${this.start + 1}-${this.start + 7}✂];`;

			block.builders.create.addLine(statement);
			block.builders.update.addLine(statement);
		} else {
			const { code } = this.compiler;
			code.overwrite(this.start + 1, this.start + 7, 'log', {
				storeName: true
			});
			const log = `[✂${this.start + 1}-${this.start + 7}✂]`;

			const dependencies = new Set();
			this.expressions.forEach(expression => {
				addToSet(dependencies, expression.dependencies);
			});

			const condition = [...dependencies].map(d => `changed.${d}`).join(' || ');

			const identifiers = this.expressions.map(e => e.node.name).join(', ');

			block.builders.update.addBlock(deindent`
				if (${condition}) {
					const { ${identifiers} } = ctx;
					console.${log}({ ${identifiers} });
					debugger;
				}
			`);

			block.builders.create.addBlock(deindent`
				{
					const { ${identifiers} } = ctx;
					console.${log}({ ${identifiers} });
					debugger;
				}
			`);
		}
	}
}
import Renderer from '../Renderer';
import Wrapper from './shared/Wrapper';
import Block from '../Block';
import DebugTag from '../../nodes/DebugTag';
import add_to_set from '../../utils/add_to_set';
import deindent from '../../utils/deindent';

export default class DebugTagWrapper extends Wrapper {
	node: DebugTag;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: DebugTag,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);
	}

	render(block: Block, parent_node: string, parent_nodes: string) {
		const { renderer } = this;
		const { component } = renderer;

		if (!renderer.options.dev) return;

		const { code } = component;

		if (this.node.expressions.length === 0) {
			// Debug all
			code.overwrite(this.node.start + 1, this.node.start + 7, 'debugger', {
				storeName: true
			});
			const statement = `[✂${this.node.start + 1}-${this.node.start + 7}✂];`;

			block.builders.create.add_line(statement);
			block.builders.update.add_line(statement);
		} else {
			const { code } = component;
			code.overwrite(this.node.start + 1, this.node.start + 7, 'log', {
				storeName: true
			});
			const log = `[✂${this.node.start + 1}-${this.node.start + 7}✂]`;

			const dependencies = new Set();
			this.node.expressions.forEach(expression => {
				add_to_set(dependencies, expression.dependencies);
			});

			const condition = Array.from(dependencies).map(d => `changed.${d}`).join(' || ');

			const identifiers = this.node.expressions.map(e => e.node.name).join(', ');

			block.builders.update.add_block(deindent`
				if (${condition}) {
					const { ${identifiers} } = ctx;
					console.${log}({ ${identifiers} });
					debugger;
				}
			`);

			block.builders.create.add_block(deindent`
				{
					const { ${identifiers} } = ctx;
					console.${log}({ ${identifiers} });
					debugger;
				}
			`);
		}
	}
}
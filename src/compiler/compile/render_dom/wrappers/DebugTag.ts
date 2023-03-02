import Renderer from '../Renderer';
import Wrapper from './shared/Wrapper';
import Block from '../Block';
import DebugTag from '../../nodes/DebugTag';
import add_to_set from '../../utils/add_to_set';
import { b, p } from 'code-red';
import { Identifier, DebuggerStatement } from 'estree';

export default class DebugTagWrapper extends Wrapper {
	node: DebugTag;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: DebugTag,
		_strip_whitespace: boolean,
		_next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);
	}

	render(block: Block, _parent_node: Identifier, _parent_nodes: Identifier) {
		const { renderer } = this;
		const { component } = renderer;

		if (!renderer.options.dev) return;

		const { var_lookup } = component;

		const start = component.locate(this.node.start + 1);
		const end = { line: start.line, column: start.column + 6 };

		const loc = { start, end };

		const debug: DebuggerStatement = {
			type: 'DebuggerStatement',
			loc
		};

		if (this.node.expressions.length === 0) {
			// Debug all
			block.chunks.create.push(debug);
			block.chunks.update.push(debug);
		} else {
			const log: Identifier = {
				type: 'Identifier',
				name: 'log',
				loc
			};

			const dependencies: Set<string> = new Set();
			this.node.expressions.forEach(expression => {
				add_to_set(dependencies, expression.dependencies);
			});

			const contextual_identifiers = this.node.expressions
				.filter(e => {
					const variable = var_lookup.get((e.node as Identifier).name);
					return !(variable && variable.hoistable);
				})
				.map(e => (e.node as Identifier).name);

			const logged_identifiers = this.node.expressions.map(e => p`${(e.node as Identifier).name}`);

			const debug_statements = b`
				${contextual_identifiers.map(name => b`const ${name} = ${renderer.reference(name)};`)}
				@_console.${log}({ ${logged_identifiers} });
				debugger;`;

			if (dependencies.size) {
				const condition = renderer.dirty(Array.from(dependencies));

				block.chunks.update.push(b`
					if (${condition}) {
						${debug_statements}
					}
				`);
			}

			block.chunks.create.push(b`{
				${debug_statements}
			}`);
		}
	}
}

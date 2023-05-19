import Wrapper from './shared/Wrapper.js';
import add_to_set from '../../utils/add_to_set.js';
import { b, p } from 'code-red';

/** @extends Wrapper<import('../../nodes/DebugTag.js').default> */
export default class DebugTagWrapper extends Wrapper {
	/**
	 * @param {import('../Renderer.js').default} renderer
	 * @param {import('../Block.js').default} block
	 * @param {import('./shared/Wrapper.js').default} parent
	 * @param {import('../../nodes/DebugTag.js').default} node
	 * @param {boolean} _strip_whitespace
	 * @param {import('./shared/Wrapper.js').default} _next_sibling
	 */
	constructor(renderer, block, parent, node, _strip_whitespace, _next_sibling) {
		super(renderer, block, parent, node);
	}

	/**
	 * @param {import('../Block.js').default} block
	 * @param {import('estree').Identifier} _parent_node
	 * @param {import('estree').Identifier} _parent_nodes
	 */
	render(block, _parent_node, _parent_nodes) {
		const { renderer } = this;
		const { component } = renderer;
		if (!renderer.options.dev) return;
		const { var_lookup } = component;
		const start = component.locate(this.node.start + 1);
		const end = { line: start.line, column: start.column + 6 };
		const loc = { start, end };

		/** @type {import('estree').DebuggerStatement} */
		const debug = {
			type: 'DebuggerStatement',
			loc
		};
		if (this.node.expressions.length === 0) {
			// Debug all
			block.chunks.create.push(debug);
			block.chunks.update.push(debug);
		} else {
			/** @type {import('estree').Identifier} */
			const log = {
				type: 'Identifier',
				name: 'log',
				loc
			};

			/** @type {Set<string>} */
			const dependencies = new Set();
			this.node.expressions.forEach((expression) => {
				add_to_set(dependencies, expression.dependencies);
			});
			const contextual_identifiers = this.node.expressions
				.filter((e) => {
					const variable = var_lookup.get(/** @type {import('estree').Identifier} */ (e.node).name);
					return !(variable && variable.hoistable);
				})
				.map((e) => /** @type {import('estree').Identifier} */ (e.node).name);
			const logged_identifiers = this.node.expressions.map(
				(e) => p`${/** @type {import('estree').Identifier} */ (e.node).name}`
			);
			const debug_statements = b`
				${contextual_identifiers.map((name) => b`const ${name} = ${renderer.reference(name)};`)}
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

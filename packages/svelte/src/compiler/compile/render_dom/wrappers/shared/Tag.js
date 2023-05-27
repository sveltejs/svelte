import { b, x } from 'code-red';
import Wrapper from './Wrapper.js';

/**
 * @template {import('../../../nodes/MustacheTag.js').default | import('../../../nodes/RawMustacheTag.js').default} NodeType
 * @extends Wrapper<NodeType>
 */
export default class Tag extends Wrapper {
	/**
	 * @param {import('../../Renderer.js').default} renderer
	 * @param {import('../../Block.js').default} block
	 * @param {import('./Wrapper.js').default} parent
	 * @param {NodeType} node
	 */
	constructor(renderer, block, parent, node) {
		super(renderer, block, parent, node);
		block.add_dependencies(node.expression.dependencies);
	}

	/**
	 * @param {import('../../Block.js').default} block
	 * @param {(value: import('estree').Node) => import('estree').Node | import('estree').Node[]} update
	 */
	rename_this_method(block, update) {
		const dependencies = this.node.expression.dynamic_dependencies();
		let snippet = this.node.expression.manipulate(block);
		const value = this.node.should_cache && block.get_unique_name(`${this.var.name}_value`);
		const content = this.node.should_cache ? value : snippet;
		snippet = x`${snippet} + ""`;
		if (this.node.should_cache) block.add_variable(value, snippet); // TODO may need to coerce snippet to string
		if (dependencies.length > 0) {
			let condition = block.renderer.dirty(dependencies);
			if (block.has_outros) {
				condition = x`!#current || ${condition}`;
			}
			const update_cached_value = x`${value} !== (${value} = ${snippet})`;
			if (this.node.should_cache) {
				condition = x`${condition} && ${update_cached_value}`;
			}
			block.chunks.update.push(
				b`if (${condition}) ${update(/** @type {import('estree').Node} */ (content))}`
			);
		}
		return { init: content };
	}
}

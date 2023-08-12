import Wrapper from './shared/Wrapper.js';
import { x } from 'code-red';

/** @extends Wrapper<import('../../nodes/Comment.js').default> */
export default class CommentWrapper extends Wrapper {
	/**
	 * @param {import('../Renderer.js').default} renderer
	 * @param {import('../Block.js').default} block
	 * @param {import('./shared/Wrapper.js').default} parent
	 * @param {import('../../nodes/Comment.js').default} node
	 */
	constructor(renderer, block, parent, node) {
		super(renderer, block, parent, node);
		this.var = /** @type {import('estree').Identifier} */ (x`c`);
	}

	/**
	 * @param {import('../Block.js').default} block
	 * @param {import('estree').Identifier} parent_node
	 * @param {import('estree').Identifier} parent_nodes
	 */
	render(block, parent_node, parent_nodes) {
		if (!this.renderer.options.preserveComments) return;
		const string_literal = {
			type: 'Literal',
			value: this.node.data,
			loc: {
				start: this.renderer.locate(this.node.start),
				end: this.renderer.locate(this.node.end)
			}
		};
		block.add_element(
			this.var,
			x`@comment(${string_literal})`,
			parent_nodes && x`@claim_comment(${parent_nodes}, ${string_literal})`,
			parent_node
		);
	}
	text() {
		if (!this.renderer.options.preserveComments) return '';
		return `<!--${this.node.data}-->`;
	}
}

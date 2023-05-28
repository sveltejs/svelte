import Wrapper from './shared/Wrapper.js';
import FragmentWrapper from './Fragment.js';
import { x, b } from 'code-red';

/** @extends Wrapper<import('../../nodes/Head.js').default> */
export default class HeadWrapper extends Wrapper {
	/** @type {import('./Fragment.js').default} */
	fragment;

	/**
	 * @param {import('../Renderer.js').default} renderer
	 * @param {import('../Block.js').default} block
	 * @param {import('./shared/Wrapper.js').default} parent
	 * @param {import('../../nodes/Head.js').default} node
	 * @param {boolean} strip_whitespace
	 * @param {import('./shared/Wrapper.js').default} next_sibling
	 */
	constructor(renderer, block, parent, node, strip_whitespace, next_sibling) {
		super(renderer, block, parent, node);
		this.fragment = new FragmentWrapper(
			renderer,
			block,
			node.children,
			this,
			strip_whitespace,
			next_sibling
		);
	}

	/**
	 * @param {import('../Block.js').default} block
	 * @param {import('estree').Identifier} _parent_node
	 * @param {import('estree').Identifier} _parent_nodes
	 */
	render(block, _parent_node, _parent_nodes) {
		/** @type {import('estree').Identifier} */
		let nodes;
		if (this.renderer.options.hydratable && this.fragment.nodes.length) {
			nodes = block.get_unique_name('head_nodes');
			block.chunks.claim.push(
				b`const ${nodes} = @head_selector('${this.node.id}', @_document.head);`
			);
		}
		this.fragment.render(
			block,
			/** @type {unknown} */ /** @type {import('estree').Identifier} */ (x`@_document.head`),
			nodes
		);
		if (nodes && this.renderer.options.hydratable) {
			block.chunks.claim.push(b`${nodes}.forEach(@detach);`);
		}
	}
}

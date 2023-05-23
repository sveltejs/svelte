import Wrapper from './shared/Wrapper.js';
import { x } from 'code-red';

/** @extends Wrapper<import('../../nodes/Text.js').default> */
export default class TextWrapper extends Wrapper {
	/** @type {string} */
	_data;

	/** @type {boolean} */
	skip;

	/** @type {import('estree').Identifier} */
	var;

	/**
	 * @param {import('../Renderer.js').default} renderer
	 * @param {import('../Block.js').default} block
	 * @param {import('./shared/Wrapper.js').default} parent
	 * @param {import('../../nodes/Text.js').default} node
	 * @param {string} data
	 */
	constructor(renderer, block, parent, node, data) {
		super(renderer, block, parent, node);
		this.skip = this.node.should_skip();
		this._data = data;
		this.var = /** @type {unknown} */ /** @type {import('estree').Identifier} */ (
			this.skip ? null : x`t`
		);
	}
	use_space() {
		return this.node.use_space();
	}
	set data(value) {
		// when updating `this.data` during optimisation
		// propagate the changes over to the underlying node
		// so that the node.use_space reflects on the latest `data` value
		this.node.data = this._data = value;
	}
	get data() {
		return this._data;
	}

	/**
	 * @param {import('../Block.js').default} block
	 * @param {import('estree').Identifier} parent_node
	 * @param {import('estree').Identifier} parent_nodes
	 */
	render(block, parent_node, parent_nodes) {
		if (this.skip) return;
		const use_space = this.use_space();
		const string_literal = {
			type: 'Literal',
			value: this.data,
			loc: {
				start: this.renderer.locate(this.node.start),
				end: this.renderer.locate(this.node.end)
			}
		};
		block.add_element(
			this.var,
			use_space ? x`@space()` : x`@text(${string_literal})`,
			parent_nodes &&
				(use_space
					? x`@claim_space(${parent_nodes})`
					: x`@claim_text(${parent_nodes}, ${string_literal})`),
			/** @type {import('estree').Identifier} */ (parent_node)
		);
	}
}

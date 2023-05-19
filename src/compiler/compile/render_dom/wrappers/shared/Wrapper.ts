import { x } from 'code-red';

/**
 * @template {import('../../../../interfaces.js').TemplateNode} [NodeType=import('../../../../interfaces.js').TemplateNode]
 */
export default class Wrapper {
	/** @type {import('../../Renderer.js').default} */
	renderer;

	/** @type {Wrapper} */
	parent;

	/** @type {NodeType} */
	node;

	/** @type {Wrapper | null} */
	prev;

	/** @type {Wrapper | null} */
	next;

	/** @type {import('estree').Identifier} */
	var;

	/**
	 * @param {import('../../Renderer.js').default} renderer
	 * @param {import('../../Block.js').default} block
	 * @param {Wrapper} parent
	 * @param {NodeType} node
	 */
	constructor(renderer, block, parent, node) {
		this.node = node;
		// make these non-enumerable so that they can be logged sensibly
		// (TODO in dev only?)
		Object.defineProperties(this, {
			renderer: {
				value: renderer
			},
			parent: {
				value: parent
			}
		});
		block.wrappers.push(this);
	}

	/**
	 * @param {import('../../Block.js').default} block
	 * @param {import('estree').Identifier} parent_node
	 * @param {import('estree').Identifier} parent_nodes
	 */
	get_or_create_anchor(block, parent_node, parent_nodes) {
		// TODO use this in EachBlock and IfBlock — tricky because
		// children need to be created first
		const needs_anchor = this.next
			? !this.next.is_dom_node()
			: !parent_node || !this.parent.is_dom_node();
		const anchor = needs_anchor
			? block.get_unique_name(`${this.var.name}_anchor`)
			: (this.next && this.next.var) || { type: 'Identifier', name: 'null' };
		if (needs_anchor) {
			block.add_element(
				anchor,
				x`@empty()`,
				parent_nodes && x`@empty()`,
				/** @type {import('estree').Identifier} */ (parent_node)
			);
		}
		return anchor;
	}

	/**
	 * @param {import('estree').Identifier} anchor
	 * @returns {import('estree').Identifier}
	 */
	get_update_mount_node(anchor) {
		return /** @type {import('estree').Identifier} */ (
			this.parent && this.parent.is_dom_node() ? this.parent.var : x`${anchor}.parentNode`
		);
	}
	is_dom_node() {
		return (
			this.node.type === 'Element' || this.node.type === 'Text' || this.node.type === 'MustacheTag'
		);
	}

	/**
	 * @param {import('../../Block.js').default} _block
	 * @param {import('estree').Identifier} _parent_node
	 * @param {import('estree').Identifier} _parent_nodes
	 * @param {Record<string, any>} _data
	 */
	render(_block, _parent_node, _parent_nodes, _data = undefined) {
		throw Error('Wrapper class is not renderable');
	}
}

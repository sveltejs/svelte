import Tag from './shared/Tag.js';
import { x } from 'code-red';
import ElementWrapper from './Element/index.js';

/** @extends Tag */
export default class MustacheTagWrapper extends Tag {
	/** @type {import('estree').Identifier} */
	var = { type: 'Identifier', name: 't' };

	/**
	 * @param {import('../Renderer.js').default} renderer
	 * @param {import('../Block.js').default} block
	 * @param {import('./shared/Wrapper.js').default} parent
	 * @param {import('../../nodes/MustacheTag.js').default | import('../../nodes/RawMustacheTag.js').default} node
	 */
	constructor(renderer, block, parent, node) {
		super(renderer, block, parent, node);
	}

	/**
	 * @param {import('../Block.js').default} block
	 * @param {import('estree').Identifier} parent_node
	 * @param {import('estree').Identifier} parent_nodes
	 * @param {Record<string, unknown> | undefined} data
	 */
	render(block, parent_node, parent_nodes, data) {
		const contenteditable_attributes =
			this.parent instanceof ElementWrapper &&
			this.parent.attributes.filter((a) => a.node.name === 'contenteditable');
		const spread_attributes =
			this.parent instanceof ElementWrapper &&
			this.parent.attributes.filter((a) => a.node.is_spread);

		/** @type {import('estree').Expression | true | undefined} */
		let contenteditable_attr_value = undefined;
		if (contenteditable_attributes.length > 0) {
			const attribute = /** @type {import('./Element/Attribute.js').default} */ (
				contenteditable_attributes[0]
			);
			if ([true, 'true', ''].includes(attribute.node.get_static_value())) {
				contenteditable_attr_value = true;
			} else {
				contenteditable_attr_value = x`${attribute.get_value(block)}`;
			}
		} else if (spread_attributes.length > 0 && data.element_data_name) {
			contenteditable_attr_value = x`${data.element_data_name}['contenteditable']`;
		}
		const { init } = this.rename_this_method(block, (value) => {
			if (contenteditable_attr_value) {
				if (contenteditable_attr_value === true) {
					return x`@set_data_contenteditable(${this.var}, ${value})`;
				} else {
					return x`@set_data_maybe_contenteditable(${this.var}, ${value}, ${contenteditable_attr_value})`;
				}
			} else {
				return x`@set_data(${this.var}, ${value})`;
			}
		});
		block.add_element(
			this.var,
			x`@text(${init})`,
			parent_nodes && x`@claim_text(${parent_nodes}, ${init})`,
			parent_node
		);
	}
}

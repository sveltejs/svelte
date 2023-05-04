import Renderer from '../Renderer';
import Block from '../Block';
import Tag from './shared/Tag';
import Wrapper from './shared/Wrapper';
import MustacheTag from '../../nodes/MustacheTag';
import RawMustacheTag from '../../nodes/RawMustacheTag';
import { x } from 'code-red';
import { Identifier, Expression } from 'estree';
import ElementWrapper from './Element';
import AttributeWrapper from './Element/Attribute';

export default class MustacheTagWrapper extends Tag {
	var: Identifier = { type: 'Identifier', name: 't' };

	constructor(renderer: Renderer, block: Block, parent: Wrapper, node: MustacheTag | RawMustacheTag) {
		super(renderer, block, parent, node);
	}

	render(block: Block, parent_node: Identifier, parent_nodes: Identifier, data: Record<string, unknown> | undefined) {
		const contenteditable_attributes =
			this.parent instanceof ElementWrapper &&
			this.parent.attributes.filter((a) => a.node.name === 'contenteditable');

		const spread_attributes =
			this.parent instanceof ElementWrapper &&
			this.parent.attributes.filter((a) => a.node.is_spread);

		let contenteditable_attr_value: Expression | true | undefined = undefined;
		if (contenteditable_attributes.length > 0) {
			const attribute = contenteditable_attributes[0] as AttributeWrapper;
			if ([true, 'true', ''].includes(attribute.node.get_static_value())) {
				contenteditable_attr_value = true;
			} else {
				contenteditable_attr_value = x`${attribute.get_value(block)}`;
			}
		}	else if (spread_attributes.length > 0 && data.element_data_name) {
			contenteditable_attr_value = x`${data.element_data_name}['contenteditable']`;
		}

		const { init } = this.rename_this_method(
			block,
			value => {
				if (contenteditable_attr_value) {
					if (contenteditable_attr_value === true) {
						return x`@set_data_contenteditable(${this.var}, ${value})`;
					} else {
						return x`@set_data_maybe_contenteditable(${this.var}, ${value}, ${contenteditable_attr_value})`;
					}
				} else {
					return x`@set_data(${this.var}, ${value})`;
				}
			}
		);

		block.add_element(
			this.var,
			x`@text(${init})`,
			parent_nodes && x`@claim_text(${parent_nodes}, ${init})`,
			parent_node
		);
	}
}

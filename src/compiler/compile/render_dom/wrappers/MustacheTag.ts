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

		let is_contenteditable: Expression | undefined = undefined;
		if (contenteditable_attributes.length > 0) {
			const value = (contenteditable_attributes[0] as AttributeWrapper).get_value(block);
			is_contenteditable = x`~@contenteditable_truthy_values.indexOf(${value})`;
		}	else if (spread_attributes.length > 0 && data.element_data_name) {
			is_contenteditable = x`~@contenteditable_truthy_values.indexOf(${data.element_data_name}['contenteditable'])`;
		}

		const { init } = this.rename_this_method(
			block,
			value => {
				if (is_contenteditable) {
					return x`${is_contenteditable} ? @set_data_contenteditable(${this.var}, ${value}) : @set_data(${this.var}, ${value})`
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

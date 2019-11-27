import Attribute from '../nodes/Attribute';
import { p, x } from 'code-red';
import { string_literal } from './stringify';
import Block from '../render_dom/Block';

export default function get_slot_data(values: Map<string, Attribute>, block: Block = null) {
	return {
		type: 'ObjectExpression',
		properties: Array.from(values.values())
			.filter(attribute => attribute.name !== 'name')
			.map(attribute => {
				const value = get_value(block, attribute);
				return p`${attribute.name}: ${value}`;
			})
	};
}

function get_value(block: Block, attribute: Attribute) {
	if (attribute.is_true) return x`true`;
	if (attribute.chunks.length === 0) return x`""`;

	let value = attribute.chunks
		.map(chunk => chunk.type === 'Text' ? string_literal(chunk.data) : (block ? chunk.manipulate(block) : chunk.node))
		.reduce((lhs, rhs) => x`${lhs} + ${rhs}`);

	if (attribute.chunks.length > 1 && attribute.chunks[0].type !== 'Text') {
		value = x`"" + ${value}`;
	}

	return value;
}
import Attribute from '../nodes/Attribute';
import { p, x } from 'code-red';
import { string_literal } from './stringify';
import Block from '../render_dom/Block';

export default function get_slot_data(block: Block, values: Map<string, Attribute>) {
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

// TODO fairly sure this is duplicated at least once
function get_value(block: Block, attribute: Attribute) {
	if (attribute.is_true) return x`true`;
	if (attribute.chunks.length === 0) return x`""`;

	let value = attribute.chunks
		.map(chunk => chunk.type === 'Text' ? string_literal(chunk.data) : chunk.manipulate(block))
		.reduce((lhs, rhs) => x`${lhs} + ${rhs}`);

	if (attribute.chunks.length > 1 && attribute.chunks[0].type !== 'Text') {
		value = x`"" + ${value}`;
	}

	return value;
}
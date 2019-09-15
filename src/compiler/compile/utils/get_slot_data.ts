import Attribute from '../nodes/Attribute';
import { p, x } from 'code-red';
import { string_literal } from './stringify';

export default function get_slot_data(values: Map<string, Attribute>, is_ssr: boolean) {
	return {
		type: 'ObjectExpression',
		properties: Array.from(values.values())
			.filter(attribute => attribute.name !== 'name')
			.map(attribute => {
				if (is_ssr) {
					throw new Error(`TODO SSR`);
				}

				const value = get_value(attribute);

				// const value = attribute.is_true
				// 	? x`true`
				// 	: attribute.chunks.length === 0
				// 		? x`""`
				// 		: attribute.chunks.length === 1 && attribute.chunks[0].type !== 'Text'
				// 			? snip(attribute.chunks[0])
				// 			: '`' + stringify_attribute(attribute, is_ssr) + '`';

				return p`${attribute.name}: ${value}`;
			})
	}
}

function get_value(attribute: Attribute) {
	if (attribute.is_true) return x`true`;
	if (attribute.chunks.length === 0) return x`""`;

	let value = attribute.chunks
		.map(chunk => chunk.type === 'Text' ? string_literal(chunk.data) : chunk.node)
		.reduce((lhs, rhs) => x`${lhs} + ${rhs}`);

	if (attribute.chunks.length > 1 && attribute.chunks[0].type !== 'Text') {
		value = x`"" + ${value}`;
	}

	return value;
}
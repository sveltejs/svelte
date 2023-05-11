import { p, x } from 'code-red';
import { string_literal } from './stringify.js';

/**
 * @param {Map<string, import('../nodes/Attribute.js').default>} values
 * @param {import('../render_dom/Block.js').default} block
 */
export default function get_slot_data(values, block = null) {
	return {
		type: 'ObjectExpression',
		properties: Array.from(values.values())
			.filter((attribute) => attribute.name !== 'name')
			.map((attribute) => {
				if (attribute.is_spread) {
					const argument = get_spread_value(block, attribute);
					return {
						type: 'SpreadElement',
						argument
					};
				}
				const value = get_value(block, attribute);
				return p`${attribute.name}: ${value}`;
			})
	};
}

/**
 * @param {import('../render_dom/Block.js').default} block
 * @param {import('../nodes/Attribute.js').default} attribute
 */
function get_value(block, attribute) {
	if (attribute.is_true) return x`true`;
	if (attribute.chunks.length === 0) return x`""`;
	let value = attribute.chunks
		.map((chunk) =>
			chunk.type === 'Text'
				? string_literal(chunk.data)
				: block
				? chunk.manipulate(block)
				: chunk.node
		)
		.reduce((lhs, rhs) => x`${lhs} + ${rhs}`);
	if (attribute.chunks.length > 1 && attribute.chunks[0].type !== 'Text') {
		value = x`"" + ${value}`;
	}
	return value;
}

/**
 * @param {import('../render_dom/Block.js').default} block
 * @param {import('../nodes/Attribute.js').default} attribute
 */
function get_spread_value(block, attribute) {
	return block ? attribute.expression.manipulate(block) : attribute.expression.node;
}

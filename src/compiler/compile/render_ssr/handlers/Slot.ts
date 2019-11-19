import Renderer, { RenderOptions } from '../Renderer';
import Slot from '../../nodes/Slot';
import { x, p } from 'code-red';
import Attribute from '../../nodes/Attribute';
import { string_literal } from '../../utils/stringify';

// TODO this is *almost* but not quite duplicated with non-SSR
function get_slot_data(values: Map<string, Attribute>) {
	return {
		type: 'ObjectExpression',
		properties: Array.from(values.values())
			.filter(attribute => attribute.name !== 'name')
			.map(attribute => {
				const value = get_value(attribute);
				return p`${attribute.name}: ${value}`;
			})
	};
}

// TODO fairly sure this is duplicated at least once
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

export default function(node: Slot, renderer: Renderer, options: RenderOptions) {
	const slot_data = get_slot_data(node.values);

	renderer.push();
	renderer.render(node.children, options);
	const result = renderer.pop();

	renderer.add_expression(x`
		$$slots.${node.slot_name}
			? $$slots.${node.slot_name}(${slot_data})
			: ${result}
	`);
}

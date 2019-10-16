import Attribute from '../../../nodes/Attribute';
import { string_literal } from '../../../utils/stringify';
import Text from '../../../nodes/Text';
import { x } from 'code-red';
import Expression from '../../../nodes/shared/Expression';
import { Expression as ESTreeExpression } from 'estree';

export function get_class_attribute_value(attribute: Attribute): ESTreeExpression {
	// handle special case — `class={possiblyUndefined}` with scoped CSS
	if (attribute.chunks.length === 2 && (attribute.chunks[1] as Text).synthetic) {
		const value = (attribute.chunks[0] as Expression).node;
		return x`@escape(@null_to_empty(${value})) + "${(attribute.chunks[1] as Text).data}"`;
	}

	return get_attribute_value(attribute);
}

export function get_attribute_value(attribute: Attribute): ESTreeExpression {
	if (attribute.chunks.length === 0) return x`""`;

	return attribute.chunks
		.map((chunk) => {
			return chunk.type === 'Text'
				? string_literal(chunk.data.replace(/"/g, '&quot;')) as ESTreeExpression
				: x`@escape(${chunk.node})`;
		})
		.reduce((lhs, rhs) => x`${lhs} + ${rhs}`);
}

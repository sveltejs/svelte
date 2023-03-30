import Attribute from '../../../nodes/Attribute';
import { string_literal } from '../../../utils/stringify';
import Text from '../../../nodes/Text';
import { x } from 'code-red';
import Expression from '../../../nodes/shared/Expression';
import { Expression as ESTreeExpression } from 'estree';
import { regex_double_quotes } from '../../../../utils/patterns';

export function get_class_attribute_value(attribute: Attribute): ESTreeExpression {
	// handle special case — `class={possiblyUndefined}` with scoped CSS
	if (attribute.chunks.length === 2 && (attribute.chunks[1] as Text).synthetic) {
		const value = (attribute.chunks[0] as Expression).node;
		return x`@escape(@null_to_empty(${value}), true) + "${(attribute.chunks[1] as Text).data}"`;
	}

	return get_attribute_value(attribute);
}

export function get_attribute_value(attribute: Attribute): ESTreeExpression {
	if (attribute.chunks.length === 0) return x`""`;

	/**
	 * For value attribute of textarea, it will render as child node of `<textarea>` element.
	 * Therefore, we need to escape as content (not attribute).
	 */
	const is_textarea_value = attribute.parent.name.toLowerCase() === 'textarea' && attribute.name.toLowerCase() === 'value';

	return attribute.chunks
		.map((chunk) => {
			return chunk.type === 'Text'
				? string_literal(chunk.data.replace(regex_double_quotes, '&quot;')) as ESTreeExpression
				: x`@escape(${chunk.node}, ${is_textarea_value ? 'false' : 'true'})`;
		})
		.reduce((lhs, rhs) => x`${lhs} + ${rhs}`);
}

export function get_attribute_expression(attribute: Attribute): ESTreeExpression {
	if (attribute.chunks.length === 1 && attribute.chunks[0].type === 'Expression') {
		return (attribute.chunks[0] as Expression).node as ESTreeExpression;
	}
	return get_attribute_value(attribute);
}

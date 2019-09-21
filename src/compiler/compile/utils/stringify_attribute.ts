import Attribute from '../nodes/Attribute';
import { string_literal } from './stringify';
import { snip } from './snip';
import Text from '../nodes/Text';
import { x } from 'code-red';

export function stringify_class_attribute(attribute: Attribute) {
	// handle special case — `class={possiblyUndefined}` with scoped CSS
	if (attribute.chunks.length === 2 && (attribute.chunks[1] as Text).synthetic) {
		return '${@escape(@null_to_empty(' + snip(attribute.chunks[0]) + '))}' + (attribute.chunks[1] as Text).data;
	}

	return stringify_attribute(attribute, true);
}

export function stringify_attribute(attribute: Attribute, is_ssr: boolean) {
	return attribute.chunks
		.map((chunk) => {
			if (chunk.type === 'Text') {
				return string_literal(chunk.data.replace(/"/g, '&quot;'));
			}

			return is_ssr
				? x`@escape(${chunk.node})`
				: chunk.node;
		})
		.reduce((lhs, rhs) => x`${lhs} + ${rhs}`);
}

import Attribute from '../nodes/Attribute';
import { escape_template, escape } from './stringify';
import { snip } from './snip';
import Text from '../nodes/Text';

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
				return escape_template(escape(chunk.data).replace(/"/g, '&quot;'));
			}

			return is_ssr
				? '${@escape(' + snip(chunk) + ')}'
				: '${' + snip(chunk) + '}';
		})
		.join('');
}

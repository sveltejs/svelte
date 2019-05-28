import Attribute from '../nodes/Attribute';
import { escape_template, escape } from './stringify';
import { snip } from './snip';

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

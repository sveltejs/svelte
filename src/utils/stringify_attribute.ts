import Attribute from '../compile/nodes/Attribute';
import Node from '../compile/nodes/shared/Node';
import { escapeTemplate, escape } from './stringify';
import { snip } from './snip';

export function stringify_attribute(attribute: Attribute) {
	return attribute.chunks
		.map((chunk: Node) => {
			if (chunk.type === 'Text') {
				return escapeTemplate(escape(chunk.data).replace(/"/g, '&quot;'));
			}

			return '${@escape(' + snip(chunk) + ')}';
		})
		.join('');
}
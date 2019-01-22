import Attribute from '../../../nodes/Attribute';
import Node from '../../../nodes/shared/Node';
import { escapeTemplate, escape } from '../../../../utils/stringify';
import { snip } from '../../utils';

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
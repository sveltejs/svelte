import Block from '../../Block';
import { escape } from '../../../../utils/stringify';
import { Node } from '../../../../interfaces';

export default function stringifyAttributeValue(block: Block, chunks: Node[]) {
	return chunks
		.map((chunk: Node) => {
			if (chunk.type === 'Text') {
				return escape(chunk.data).replace(/"/g, '&quot;');
			}

			block.contextualise(chunk.expression);
			const { snippet } = chunk.metadata;
			return '${' + snippet + '}';
		})
		.join('');
}
import { decode_character_references } from '../utils/html.js';

/**
 * @param {import('../index.js').Parser} parser
 */
export default function text(parser) {
	const start = parser.index;

	let data = '';

	while (parser.index < parser.template.length && !parser.match('<') && !parser.match('{')) {
		data += parser.template[parser.index++];
	}

	const node = {
		start,
		end: parser.index,
		type: 'Text',
		raw: data,
		data: decode_character_references(data, false)
	};

	parser.current().children.push(node);
}

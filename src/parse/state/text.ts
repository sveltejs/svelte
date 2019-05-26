import { decode_character_references } from '../utils/html';
import { Parser } from '../index';

export default function text(parser: Parser) {
	const start = parser.index;

	let data = '';

	while (
		parser.index < parser.template.length &&
		!parser.match('<') &&
		!parser.match('{')
	) {
		data += parser.template[parser.index++];
	}

	let node = {
		start,
		end: parser.index,
		type: 'Text',
		raw: data,
		data: decode_character_references(data),
	};

	parser.current().children.push(node);
}

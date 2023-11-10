import { decode_character_references } from '../utils/html.js';

/** @param {import('../index.js').Parser} parser */
export default function text(parser) {
	const start = parser.index;

	let data = '';

	while (parser.index < parser.template.length && !parser.match('<') && !parser.match('{')) {
		data += parser.template[parser.index++];
	}

	parser.append(
		/** @type {import('#compiler').Text} */ ({
			type: 'Text',
			start,
			end: parser.index,
			raw: data,
			data: decode_character_references(data, false)
		})
	);
}

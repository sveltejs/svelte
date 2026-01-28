/** @import { AST } from '#compiler' */
/** @import { Parser } from '../index.js' */
import { decode_character_references } from '../utils/html.js';

/** @param {Parser} parser */
export default function text(parser) {
	const start = parser.index;

	let data = '';

	while (parser.index < parser.template.length && !parser.match('<') && !parser.match('{')) {
		data += parser.template[parser.index++];
	}

	/** @type {AST.Text} */
	parser.append({
		type: 'Text',
		start,
		end: parser.index,
		raw: data,
		data: decode_character_references(data, false)
	});
}

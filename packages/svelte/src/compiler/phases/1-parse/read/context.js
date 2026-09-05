/** @import { Pattern } from 'estree' */
/** @import { Parser } from '../index.js' */
import { parse_pattern_at } from '../js.js';
import * as e from '../../../errors.js';

/**
 * @param {Parser} parser
 * @returns {Pattern}
 */
export default function read_pattern(parser) {
	const start = parser.index;

	const id = parser.read_identifier();

	if (id.name !== '') {
		const after = parser.index;
		parser.allow_whitespace();

		// a type annotation makes it a job for the parser
		if (!parser.match(':')) {
			parser.index = after;
			return id;
		}
	} else {
		const char = parser.template[start];

		if (char !== '{' && char !== '[') {
			e.expected_pattern(start);
		}
	}

	const { node, end } = parse_pattern_at(parser, start);
	parser.index = end;

	return node;
}

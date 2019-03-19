import { parse_expression_at } from '../acorn';
import { Parser } from '../index';

const literals = new Map([['true', true], ['false', false], ['null', null]]);

export default function read_expression(parser: Parser) {
	const start = parser.index;

	const name = parser.read_until(/\s*}/);
	if (name && /^[a-z]+$/.test(name)) {
		const end = start + name.length;

		if (literals.has(name)) {
			return {
				type: 'Literal',
				start,
				end,
				value: literals.get(name),
				raw: name,
			};
		}

		return {
			type: 'Identifier',
			start,
			end: start + name.length,
			name,
		};
	}

	parser.index = start;

	try {
		const node = parse_expression_at(parser.template, parser.index);
		parser.index = node.end;

		return node;
	} catch (err) {
		parser.acorn_error(err);
	}
}

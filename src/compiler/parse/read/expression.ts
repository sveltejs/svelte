import { parse_expression_at } from '../acorn';
import { Parser } from '../index';
import { Identifier, Node, SimpleLiteral } from 'estree';
import { whitespace } from '../../utils/patterns';

const literals = new Map([['true', true], ['false', false], ['null', null]]);

export default function read_expression(parser: Parser): Node {
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
			} as SimpleLiteral;
		}

		return {
			type: 'Identifier',
			start,
			end: start + name.length,
			name,
		} as Identifier;
	}

	parser.index = start;

	try {
		const node = parse_expression_at(parser.template, parser.index);

		let num_parens = 0;

		for (let i = parser.index; i < node.start; i += 1) {
			if (parser.template[i] === '(') num_parens += 1;
		}

		let index = node.end;
		while (num_parens > 0) {
			const char = parser.template[index];

			if (char === ')') {
				num_parens -= 1;
			} else if (!whitespace.test(char)) {
				parser.error({
					code: 'unexpected-token',
					message: 'Expected )'
				}, index);
			}

			index += 1;
		}

		parser.index = index;

		return node as Node;
	} catch (err) {
		parser.acorn_error(err);
	}
}

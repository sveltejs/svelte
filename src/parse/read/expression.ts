import { parseExpressionAt } from 'acorn';
import { Parser } from '../index';

const literals = new Map([['true', true], ['false', false], ['null', null]]);

export default function readExpression(parser: Parser) {
	const start = parser.index;

	const name = parser.readUntil(/\s*}/);
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
		const node = parseExpressionAt(parser.template, parser.index, {
			ecmaVersion: 9,
			preserveParens: true,
		});
		parser.index = node.end;

		return node;
	} catch (err) {
		parser.acornError(err);
	}
}

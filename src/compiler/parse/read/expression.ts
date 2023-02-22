import { parse_expression_at } from '../acorn';
import { Parser } from '../index';
import { Node } from 'estree';
import { regex_whitespace } from '../../utils/patterns';
import parser_errors from '../errors';

export default function read_expression(parser: Parser): Node {
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
			} else if (!regex_whitespace.test(char)) {
				parser.error(parser_errors.unexpected_token(')'), index);
			}

			index += 1;
		}

		parser.index = index;

		return node as Node;
	} catch (err) {
		parser.acorn_error(err);
	}
}

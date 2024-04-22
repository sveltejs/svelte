import { parse_expression_at } from '../acorn.js';
import { regex_whitespace } from '../../patterns.js';
import * as e from '../../../errors.js';

/**
 * @param {import('../index.js').Parser} parser
 * @returns {import('estree').Expression}
 */
export default function read_expression(parser) {
	try {
		const node = parse_expression_at(parser.template, parser.ts, parser.index);

		let num_parens = 0;

		for (let i = parser.index; i < /** @type {number} */ (node.start); i += 1) {
			if (parser.template[i] === '(') num_parens += 1;
		}

		let index = /** @type {number} */ (node.end);
		while (num_parens > 0) {
			const char = parser.template[index];

			if (char === ')') {
				num_parens -= 1;
			} else if (!regex_whitespace.test(char)) {
				e.expected_token(index, ')');
			}

			index += 1;
		}

		parser.index = index;

		return /** @type {import('estree').Expression} */ (node);
	} catch (err) {
		parser.acorn_error(err);
	}
}

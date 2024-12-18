/** @import { Expression } from 'estree' */
/** @import { Parser } from '../index.js' */
import { parse_expression_at } from '../acorn.js';
import { regex_whitespace } from '../../patterns.js';
import * as e from '../../../errors.js';
import { find_matching_bracket } from '../utils/bracket.js';

/**
 * @param {Parser} parser
 * @param {string} [opening_token]
 * @returns {Expression}
 */
export default function read_expression(parser, opening_token) {
	try {
		const node = parse_expression_at(parser.template, parser.ts, parser.index);

		let num_parens = 0;

		for (let i = parser.index; i < /** @type {number} */ (node.start); i += 1) {
			if (parser.template[i] === '(') num_parens += 1;
		}

		let index = /** @type {number} */ (node.end);
		if (node.trailingComments !== undefined && node.trailingComments.length > 0) {
			index = node.trailingComments.at(-1).end;
		}

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

		return /** @type {Expression} */ (node);
	} catch (err) {
		if (parser.loose) {
			// Find the next } and treat it as the end of the expression
			const end = find_matching_bracket(parser.template, parser.index, opening_token ?? '{');
			if (end) {
				const start = parser.index;
				parser.index = end;
				// We don't know what the expression is and signal this by returning an empty identifier
				return {
					type: 'Identifier',
					start,
					end,
					name: ''
				};
			}
		}

		parser.acorn_error(err);
	}
}

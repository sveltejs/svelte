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
		if (node.trailingComments !== undefined && node.trailingComments.length > 0) {
			// in simple expressions like {true/*this is literal*/} trailing comments are not included
			// in the node end so we need them added to the index to keep the parser in check.
			// but for arrow functions trailing comments are actually already included in the end
			// and doesn't include whitespace in the end so if we set the parse index to that we
			// will loose chars that we already read.
			index = Math.max(node.trailingComments.at(-1).end, index);
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

		return /** @type {import('estree').Expression} */ (node);
	} catch (err) {
		parser.acorn_error(err);
	}
}

/** @import { Expression } from 'estree' */
/** @import { Parser } from '../index.js' */
import { parse_expression_at } from '../acorn.js';
import { regex_whitespace } from '../../patterns.js';
import * as e from '../../../errors.js';

/**
 * @param {Parser} parser
 * @returns {Expression}
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
			let index = parser.index;
			let num_braces = 0;
			while (index < parser.template.length) {
				const char = parser.template[index];
				if (char === '{') num_braces += 1;
				if (char === '}') {
					if (num_braces === 0) {
						// We assume that there's some kind of whitespace or the start of the closing tag after the closing brace,
						// else this hints at a wrong counting of braces (e.g. in the case of foo={'hi}'})
						if (!/[\s>/]/.test(parser.template[index + 1])) {
							num_braces += 1;
							continue;
						}

						const start = parser.index;
						parser.index = index;
						// We don't know what the expression is and signal this by returning an empty identifier
						return {
							type: 'Identifier',
							start,
							end: index,
							name: ''
						};
					}
					num_braces -= 1;
				}
				index += 1;
			}
		}

		parser.acorn_error(err);
	}
}

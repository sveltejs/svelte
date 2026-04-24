/** @import { Expression } from 'estree' */
/** @import { Parser } from '../index.js' */
import { parse_expression_at } from '../acorn.js';
import { match_bracket } from '../utils/bracket.js';

/**
 * @param {Parser} parser
 * @param {string} [open]
 * @param {string} [close]
 * @returns {Expression}
 */
export function get_loose_identifier(parser, open = '{', close = '}') {
	// Find the next } and treat it as the end of the expression
	const start = parser.index;
	const end = match_bracket(parser.template, parser.index, open, close, 1) - 1;

	parser.index = end;

	// We don't know what the expression is and signal this by returning an empty identifier
	return { type: 'Identifier', start, end, name: '' };
}

/**
 * @param {Parser} parser
 * @param {string} [open]
 * @param {string} [close]
 * @returns {Expression}
 */
export function read_expression(parser, open, close) {
	/** @type {Expression} */
	let expression;

	try {
		expression = /** @type {Expression} */ (
			parse_expression_at(parser, parser.template, parser.index)
		);
	} catch (err) {
		if (!parser.loose) {
			throw err;
		}

		expression = get_loose_identifier(parser, open, close);
	}

	if (close) {
		parser.allow_whitespace();
		parser.eat(close, true);
	}

	return expression;
}

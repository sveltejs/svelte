/** @import { Expression } from 'estree' */
/** @import { Parser } from '../index.js' */
import { parse_expression_at } from '../acorn.js';
import { match_bracket } from '../utils/bracket.js';

/**
 * @param {Parser} parser
 * @param {string} [open]
 * @returns {Expression}
 */
export function get_loose_identifier(parser, open = '{') {
	// Find the next } and treat it as the end of the expression
	const start = parser.index;
	const end = match_bracket(parser.template, parser.index, open, open === '{' ? '}' : ')', 1) - 1;

	parser.index = end;

	// We don't know what the expression is and signal this by returning an empty identifier
	return { type: 'Identifier', start, end, name: '' };
}

/**
 * @param {Parser} parser
 * @param {string} [opening_token]
 * @returns {Expression}
 */
export default function read_expression(parser, opening_token) {
	try {
		return /** @type {Expression} */ (parse_expression_at(parser, parser.template, parser.index));
	} catch (err) {
		// If we are in an each loop we need the error to be thrown in cases like
		// `as { y = z }` so we still throw and handle the error there
		if (parser.loose) {
			return get_loose_identifier(parser, opening_token);
		}

		throw err;
	}
}

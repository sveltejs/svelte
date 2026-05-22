/** @import { Expression } from 'estree' */
/** @import { Parser } from '../index.js' */
import { parse_expression_at, remove_parens } from '../acorn.js';
import { regex_whitespace } from '../../patterns.js';
import * as e from '../../../errors.js';
import { find_matching_bracket } from '../utils/bracket.js';

/**
 * @param {Parser} parser
 * @param {string} [opening_token]
 * @returns {Expression | undefined}
 */
export function get_loose_identifier(parser, opening_token) {
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

/**
 * @param {Parser} parser
 * @param {string} [opening_token]
 * @param {boolean} [disallow_loose]
 * @returns {Expression}
 */
export default function read_expression(parser, opening_token, disallow_loose) {
	try {
		const node = parse_expression_at(parser, parser.template, parser.index);

		let index = /** @type {number} */ (node.end);

		const last_comment = parser.root.comments.at(-1);
		if (last_comment && last_comment.end > index) index = last_comment.end;

		parser.index = index;

		return /** @type {Expression} */ (remove_parens(node));
	} catch (err) {
		// If we are in an each loop we need the error to be thrown in cases like
		// `as { y = z }` so we still throw and handle the error there
		if (parser.loose && !disallow_loose) {
			const expression = get_loose_identifier(parser, opening_token);
			if (expression) {
				return expression;
			}
		}

		throw err;
	}
}

/** @import { Parser } from '../index.js' */
import * as e from '../../../errors.js';

/** @type {Record<string, string>} */
const default_brackets = {
	'{': '}',
	'(': ')',
	'[': ']'
};

const default_close = new Set(Object.values(default_brackets));

/**
 * @param {Parser} parser
 * @param {number} start
 * @param {Record<string, string>} brackets
 */
export function match_bracket(parser, start, brackets = default_brackets) {
	const close = brackets === default_brackets ? default_close : new Set(Object.values(brackets));
	const bracket_stack = [];

	let i = start;

	while (i < parser.template.length) {
		let char = parser.template[i++];

		if (char === "'" || char === '"' || char === '`') {
			i = match_quote(parser, i, char);
			continue;
		}

		if (char in brackets) {
			bracket_stack.push(char);
		} else if (close.has(char)) {
			const popped = /** @type {string} */ (bracket_stack.pop());
			const expected = /** @type {string} */ (brackets[popped]);

			if (char !== expected) {
				e.expected_token(i - 1, expected);
			}

			if (bracket_stack.length === 0) {
				return i;
			}
		}
	}

	e.unexpected_eof(parser.template.length);
}

/**
 * @param {Parser} parser
 * @param {number} start
 * @param {string} quote
 */
function match_quote(parser, start, quote) {
	let is_escaped = false;
	let i = start;

	while (i < parser.template.length) {
		const char = parser.template[i++];

		if (is_escaped) {
			is_escaped = false;
			continue;
		}

		if (char === quote) {
			return i;
		}

		if (char === '\\') {
			is_escaped = true;
		}

		if (quote === '`' && char === '$' && parser.template[i] === '{') {
			i = match_bracket(parser, i);
		}
	}

	e.unterminated_string_constant(start);
}

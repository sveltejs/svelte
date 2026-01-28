/** @import { Parser } from '../index.js' */
import * as e from '../../../errors.js';

/**
 * @param {number} num
 * @returns {number} Infinity if {@link num} is negative, else {@link num}.
 */
function infinity_if_negative(num) {
	if (num < 0) {
		return Infinity;
	}
	return num;
}

/**
 * @param {string} string The string to search.
 * @param {number} search_start_index The index to start searching at.
 * @param {"'" | '"' | '`'} string_start_char The character that started this string.
 * @returns {number} The index of the end of this string expression, or `Infinity` if not found.
 */
function find_string_end(string, search_start_index, string_start_char) {
	let string_to_search;
	if (string_start_char === '`') {
		string_to_search = string;
	} else {
		// we could slice at the search start index, but this way the index remains valid
		string_to_search = string.slice(
			0,
			infinity_if_negative(string.indexOf('\n', search_start_index))
		);
	}

	return find_unescaped_char(string_to_search, search_start_index, string_start_char);
}

/**
 * @param {string} string The string to search.
 * @param {number} search_start_index The index to start searching at.
 * @returns {number} The index of the end of this regex expression, or `Infinity` if not found.
 */
function find_regex_end(string, search_start_index) {
	return find_unescaped_char(string, search_start_index, '/');
}

/**
 *
 * @param {string} string The string to search.
 * @param {number} search_start_index The index to begin the search at.
 * @param {string} char The character to search for.
 * @returns {number} The index of the first unescaped instance of {@link char}, or `Infinity` if not found.
 */
function find_unescaped_char(string, search_start_index, char) {
	let i = search_start_index;
	while (true) {
		const found_index = string.indexOf(char, i);
		if (found_index === -1) {
			return Infinity;
		}
		if (count_leading_backslashes(string, found_index - 1) % 2 === 0) {
			return found_index;
		}
		i = found_index + 1;
	}
}

/**
 * Count consecutive leading backslashes before {@link search_start_index}.
 *
 * @example
 * ```js
 * count_leading_backslashes('\\\\\\foo', 2); // 3 (the backslashes have to be escaped in the string literal, there are three in reality)
 * ```
 *
 * @param {string} string The string to search.
 * @param {number} search_start_index The index to begin the search at.
 */
function count_leading_backslashes(string, search_start_index) {
	let i = search_start_index;
	let count = 0;
	while (string[i] === '\\') {
		count++;
		i--;
	}
	return count;
}

/**
 * Finds the corresponding closing bracket, ignoring brackets found inside comments, strings, or regex expressions.
 * @param {string} template The string to search.
 * @param {number} index The index to begin the search at.
 * @param {string} open The opening bracket (ex: `'{'` will search for `'}'`).
 * @returns {number | undefined} The index of the closing bracket, or undefined if not found.
 */
export function find_matching_bracket(template, index, open) {
	const close = default_brackets[open];
	let brackets = 1;
	let i = index;
	while (brackets > 0 && i < template.length) {
		const char = template[i];
		switch (char) {
			case "'":
			case '"':
			case '`':
				i = find_string_end(template, i + 1, char) + 1;
				continue;
			case '/': {
				const next_char = template[i + 1];
				if (!next_char) continue;
				if (next_char === '/') {
					i = infinity_if_negative(template.indexOf('\n', i + 1)) + '\n'.length;
					continue;
				}
				if (next_char === '*') {
					i = infinity_if_negative(template.indexOf('*/', i + 1)) + '*/'.length;
					continue;
				}
				i = find_regex_end(template, i + 1) + '/'.length;
				continue;
			}
			default: {
				const char = template[i];
				if (char === open) {
					brackets++;
				} else if (char === close) {
					brackets--;
				}
				if (brackets === 0) {
					return i;
				}
				i++;
			}
		}
	}
	return undefined;
}

/** @type {Record<string, string>} */
const default_brackets = {
	'{': '}',
	'(': ')',
	'[': ']'
};

/**
 * @param {Parser} parser
 * @param {number} start
 * @param {Record<string, string>} brackets
 */
export function match_bracket(parser, start, brackets = default_brackets) {
	const close = Object.values(brackets);
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
		} else if (close.includes(char)) {
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

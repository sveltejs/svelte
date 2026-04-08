import * as e from '../../../errors.js';

/**
 * @param {string} haystack
 * @param {string} needle
 * @param {number} start
 */
function find_end(haystack, needle, start) {
	const i = haystack.indexOf(needle, start);

	if (i === -1) {
		e.unexpected_eof(haystack.length);
	}

	return i + needle.length;
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
			e.unexpected_eof(string.length);
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
 * @returns {number} The index of the closing bracket
 */
export function find_matching_bracket(template, index, open) {
	const close = default_brackets[open];
	return match_bracket(template, index, open, close, 1) - 1;
}

/** @type {Record<string, string>} */
const default_brackets = {
	'{': '}',
	'(': ')',
	'[': ']'
};

/**
 * @param {string} source
 * @param {number} start
 * @param {string} open
 * @param {string} close
 */
export function match_bracket(source, start, open, close, offset = 0) {
	let depth = offset;

	let i = start;

	while (i < source.length) {
		let char = source[i++];

		if (char === "'" || char === '"' || char === '`') {
			i = match_quote(source, i, char);
			continue;
		}

		if (char === '/') {
			const next = source[i + 1];

			if (next === '/') {
				i = find_end(source, '\n', i + 1);
			} else if (next === '*') {
				i = find_end(source, '*/', i + 1);
			} else {
				i = find_regex_end(source, i + 1) + '/'.length;
			}

			continue;
		}

		if (char === open) {
			++depth;
		} else if (char === close) {
			if (--depth === 0) {
				return i;
			}
		}
	}

	e.unexpected_eof(source.length);
}

/**
 * @param {string} source
 * @param {number} start
 * @param {string} quote
 */
function match_quote(source, start, quote) {
	let is_escaped = false;
	let i = start;

	while (i < source.length) {
		const char = source[i++];

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

		if (quote === '`' && char === '$' && source[i] === '{') {
			i = match_bracket(source, i, '{', '}');
		}
	}

	e.unterminated_string_constant(start);
}

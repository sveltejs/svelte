import full_char_code_at from './full_char_code_at.js';

const SQUARE_BRACKET_OPEN = '['.charCodeAt(0);
const SQUARE_BRACKET_CLOSE = ']'.charCodeAt(0);
const CURLY_BRACKET_OPEN = '{'.charCodeAt(0);
const CURLY_BRACKET_CLOSE = '}'.charCodeAt(0);

/** @param {number} code */
export function is_bracket_open(code) {
	return code === SQUARE_BRACKET_OPEN || code === CURLY_BRACKET_OPEN;
}

/** @param {number} code */
export function is_bracket_close(code) {
	return code === SQUARE_BRACKET_CLOSE || code === CURLY_BRACKET_CLOSE;
}

/**
 * @param {number} open
 * @param {number} close
 */
export function is_bracket_pair(open, close) {
	return (
		(open === SQUARE_BRACKET_OPEN && close === SQUARE_BRACKET_CLOSE) ||
		(open === CURLY_BRACKET_OPEN && close === CURLY_BRACKET_CLOSE)
	);
}

/** @param {number} open */
export function get_bracket_close(open) {
	if (open === SQUARE_BRACKET_OPEN) {
		return SQUARE_BRACKET_CLOSE;
	}
	if (open === CURLY_BRACKET_OPEN) {
		return CURLY_BRACKET_CLOSE;
	}
}

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
	const open_code = full_char_code_at(open, 0);
	const close_code = get_bracket_close(open_code);
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
				const code = full_char_code_at(template, i);
				if (code === open_code) {
					brackets++;
				} else if (code === close_code) {
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

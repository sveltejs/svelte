import * as e from '../../../errors.js';

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
			const next = source[i];

			if (next === '/') {
				i = find_end(source, '\n', i + 1);
			} else if (next === '*') {
				i = find_end(source, '*/', i + 1);
			} else {
				do {
					i = find_end(source, char, i);
				} while (is_escaped(source, i - 1));
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
 * Returns true if there are an odd number of backslashes directly before {@link index}
 *
 * @example
 * ```js
 * is_escaped('\\\\\\foo', 3); // true (the backslashes have to be escaped in the string literal, there are three in reality)
 * ```
 *
 * @param {string} string The string to search.
 * @param {number} index The index of the character being checked
 */
function is_escaped(string, index) {
	let start = index;

	while (string.charCodeAt(start - 1) === 92) {
		start--;
	}

	return (index - start) % 2 !== 0;
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

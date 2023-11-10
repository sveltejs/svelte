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

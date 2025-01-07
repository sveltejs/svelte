const SINGLE_QUOTE = "'";
const DOUBLE_QUOTE = '"';
const BACK_QUOTE = '`';

/** @param {string} char */
export function is_quote(char) {
	return char === SINGLE_QUOTE || char === DOUBLE_QUOTE || char === BACK_QUOTE;
}

/** @param {string} char */
export function is_back_quote(char) {
	return char === BACK_QUOTE;
}

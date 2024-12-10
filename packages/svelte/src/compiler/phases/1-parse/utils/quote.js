const SINGLE_QUOTE = "'".charCodeAt(0);
const DOUBLE_QUOTE = '"'.charCodeAt(0);
const BACK_QUOTE = '`'.charCodeAt(0);

/** @param {number} code */
export function is_quote(code) {
	return code === SINGLE_QUOTE || code === DOUBLE_QUOTE || code === BACK_QUOTE;
}

/** @param {number} code */
export function is_back_quote(code) {
	return code === BACK_QUOTE;
}

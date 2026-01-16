/**
 * Error codes for CSS parsing errors
 * @typedef {'css_expected_identifier' | 'css_empty_declaration' | 'css_selector_invalid' | 'expected_token' | 'unexpected_eof'} CSSParseErrorCode
 */

export class CSSParseError extends Error {
	name = 'CSSParseError';

	/** @type {CSSParseErrorCode} */
	code;

	/** @type {number} */
	position;

	/** @type {number | undefined} */
	end;

	/**
	 * @param {CSSParseErrorCode} code
	 * @param {string} message
	 * @param {number} position - Byte position in the CSS source (start)
	 * @param {number} [end] - End byte position (defaults to position)
	 */
	constructor(code, message, position, end) {
		super(message);
		this.code = code;
		this.position = position;
		this.end = end;
	}
}

/**
 * @param {number} position
 * @returns {never}
 */
export function css_expected_identifier(position) {
	throw new CSSParseError('css_expected_identifier', 'Expected a valid CSS identifier', position);
}

/**
 * @param {number} start
 * @param {number} end
 * @returns {never}
 */
export function css_empty_declaration(start, end) {
	throw new CSSParseError('css_empty_declaration', 'Declaration cannot be empty', start, end);
}

/**
 * @param {number} position
 * @returns {never}
 */
export function css_selector_invalid(position) {
	throw new CSSParseError('css_selector_invalid', 'Invalid selector', position);
}

/**
 * @param {number} position
 * @param {string} token
 * @returns {never}
 */
export function expected_token(position, token) {
	throw new CSSParseError('expected_token', `Expected ${token}`, position);
}

/**
 * @param {number} position
 * @returns {never}
 */
export function unexpected_eof(position) {
	throw new CSSParseError('unexpected_eof', 'Unexpected end of input', position);
}

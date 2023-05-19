import * as code_red from 'code-red';

/**
 * @param {string} source
 */
export const parse = (source) =>
	code_red.parse(source, {
		sourceType: 'module',
		ecmaVersion: 13,
		locations: true
	});

/**
 * @param {string} source
 * @param {number} index
 */
export const parse_expression_at = (source, index) =>
	code_red.parseExpressionAt(source, index, {
		sourceType: 'module',
		ecmaVersion: 13,
		locations: true
	});

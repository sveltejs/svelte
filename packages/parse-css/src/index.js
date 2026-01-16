/** @import { StyleSheet } from './public.js' */
import { Parser } from './parser.js';
import { read_stylesheet } from './css.js';

export { CSSParseError } from './error.js';

/**
 * Parse CSS source code into an AST
 * @param {string} source - CSS source code to parse
 * @returns {StyleSheet}
 */
export function parse(source) {
	const parser = new Parser(source);
	return read_stylesheet(parser);
}

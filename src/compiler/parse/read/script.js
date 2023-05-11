import * as acorn from '../acorn';
import parser_errors from '../errors';
import { regex_not_newline_characters } from '../../utils/patterns';
const regex_closing_script_tag = /<\/script\s*>/;
const regex_starts_with_closing_script_tag = /^<\/script\s*>/;

/**
 * @param {Parser} parser
 * @param {any[]} attributes
 * @param {number} start
 * @returns {string}
 */
function get_context(parser, attributes, start) {
	const context = attributes.find((attribute) => attribute.name === 'context');
	if (!context) return 'default';
	if (context.value.length !== 1 || context.value[0].type !== 'Text') {
		parser.error(parser_errors.invalid_script_context_attribute, start);
	}
	const value = context.value[0].data;
	if (value !== 'module') {
		parser.error(parser_errors.invalid_script_context_value, context.start);
	}
	return value;
}

/**
 * @param {Parser} parser
 * @param {number} start
 * @param {Node[]} attributes
 * @returns {Script}
 */
export default function read_script(parser, start, attributes) {
	const script_start = parser.index;
	const data = parser.read_until(regex_closing_script_tag, parser_errors.unclosed_script);
	if (parser.index >= parser.template.length) {
		parser.error(parser_errors.unclosed_script);
	}
	const source =
		parser.template.slice(0, script_start).replace(regex_not_newline_characters, ' ') + data;
	parser.read(regex_starts_with_closing_script_tag);

	/**
	 * @type {Program}
	 */
	let ast;
	try {
		ast = acorn.parse(source);
	} catch (err) {
		parser.acorn_error(err);
	}
	// TODO is this necessary?
	ast.start = script_start;
	return {
		type: 'Script',
		start,
		end: parser.index,
		context: get_context(parser, attributes, start),
		content: ast
	};
}

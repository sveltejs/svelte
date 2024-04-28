import * as acorn from '../acorn.js';
import { regex_not_newline_characters } from '../../patterns.js';
import * as e from '../../../errors.js';

const regex_closing_script_tag = /<\/script\s*>/;
const regex_starts_with_closing_script_tag = /^<\/script\s*>/;

/**
 * @param {any[]} attributes
 * @returns {string}
 */
function get_context(attributes) {
	const context = attributes.find(
		/** @param {any} attribute */ (attribute) => attribute.name === 'context'
	);
	if (!context) return 'default';

	if (context.value.length !== 1 || context.value[0].type !== 'Text') {
		e.script_invalid_context(context.start);
	}

	const value = context.value[0].data;

	if (value !== 'module') {
		e.script_invalid_context(context.start);
	}

	return value;
}

/**
 * @param {import('../index.js').Parser} parser
 * @param {number} start
 * @param {Array<import('#compiler').Attribute | import('#compiler').SpreadAttribute | import('#compiler').Directive>} attributes
 * @returns {import('#compiler').Script}
 */
export function read_script(parser, start, attributes) {
	const script_start = parser.index;
	const data = parser.read_until(regex_closing_script_tag);
	if (parser.index >= parser.template.length) {
		e.element_unclosed(parser.template.length, 'script');
	}

	const source =
		parser.template.slice(0, script_start).replace(regex_not_newline_characters, ' ') + data;
	parser.read(regex_starts_with_closing_script_tag);

	/** @type {import('estree').Program} */
	let ast;

	try {
		ast = acorn.parse(source, parser.ts);
	} catch (err) {
		parser.acorn_error(err);
	}

	// TODO is this necessary?
	ast.start = script_start;

	return {
		type: 'Script',
		start,
		end: parser.index,
		context: get_context(attributes),
		content: ast,
		parent: null,
		// @ts-ignore
		attributes: attributes
	};
}

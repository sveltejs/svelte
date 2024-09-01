/** @import { Program } from 'estree' */
/** @import { AST, Directive } from '#compiler' */
/** @import { Parser } from '../index.js' */
import * as acorn from '../acorn.js';
import { regex_not_newline_characters } from '../../patterns.js';
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';
import { is_text_attribute } from '../../../utils/ast.js';

const regex_closing_script_tag = /<\/script\s*>/;
const regex_starts_with_closing_script_tag = /^<\/script\s*>/;

const RESERVED_ATTRIBUTES = ['server', 'client', 'worker', 'test', 'default'];
const ALLOWED_ATTRIBUTES = ['context', 'generics', 'lang', 'module'];

/**
 * @param {Parser} parser
 * @param {number} start
 * @param {Array<AST.Attribute | AST.SpreadAttribute | Directive>} attributes
 * @returns {AST.Script}
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

	/** @type {Program} */
	let ast;

	try {
		ast = acorn.parse(source, parser.ts);
	} catch (err) {
		parser.acorn_error(err);
	}

	// TODO is this necessary?
	ast.start = script_start;

	/** @type {'default' | 'module'} */
	let context = 'default';

	for (const attribute of /** @type {AST.Attribute[]} */ (attributes)) {
		if (RESERVED_ATTRIBUTES.includes(attribute.name)) {
			e.script_reserved_attribute(attribute, attribute.name);
		}

		if (!ALLOWED_ATTRIBUTES.includes(attribute.name)) {
			w.script_unknown_attribute(attribute);
		}

		if (attribute.name === 'module') {
			if (attribute.value !== true) {
				// Deliberately a generic code to future-proof for potential other attributes
				e.script_invalid_attribute_value(attribute, attribute.name);
			}

			context = 'module';
		}

		if (attribute.name === 'context') {
			if (attribute.value === true || !is_text_attribute(attribute)) {
				e.script_invalid_context(attribute);
			}

			const value = attribute.value[0].data;

			if (value !== 'module') {
				e.script_invalid_context(attribute);
			}

			w.script_context_deprecated(attribute);

			context = 'module';
		}
	}

	return {
		type: 'Script',
		start,
		end: parser.index,
		context,
		content: ast,
		parent: null,
		// @ts-ignore
		attributes
	};
}

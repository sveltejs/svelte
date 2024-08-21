/** @import { Program } from 'estree' */
/** @import { Attribute, SpreadAttribute, Directive, Script } from '#compiler' */
/** @import { Parser } from '../index.js' */
import * as acorn from '../acorn.js';
import { regex_not_newline_characters } from '../../patterns.js';
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';

const regex_closing_script_tag = /<\/script\s*>/;
const regex_starts_with_closing_script_tag = /^<\/script\s*>/;

/**
 * @param {any[]} attributes
 * @returns {string}
 */
function get_context(attributes) {
	for (const attribute of attributes) {
		switch (attribute.name) {
			case 'context': {
				if (attribute.value.length !== 1 || attribute.value[0].type !== 'Text') {
					e.script_invalid_context(attribute.start);
				}

				const value = attribute.value[0].data;

				if (value !== 'module') {
					e.script_invalid_context(attribute.start);
				}

				w.script_context_deprecated(attribute);

				return value;
			}
			case 'module': {
				if (attribute.value !== true) {
					// Deliberately a generic code to future-proof for potential other attributes
					e.script_invalid_attribute_value(attribute.start, attribute.name);
				}

				return 'module';
			}
			case 'server':
			case 'client':
			case 'worker':
			case 'test':
			case 'default': {
				e.script_reserved_attribute(attribute.start, attribute.name);
			}
		}
	}

	return 'default';
}

/**
 * @param {Parser} parser
 * @param {number} start
 * @param {Array<Attribute | SpreadAttribute | Directive>} attributes
 * @returns {Script}
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

/** @import { Location } from 'locate-character' */
/** @import { Pattern } from 'estree' */
/** @import { Parser } from '../index.js' */
import { match_bracket } from '../utils/bracket.js';
import { parse_expression_at } from '../acorn.js';
import { regex_not_newline_characters } from '../../patterns.js';
import * as e from '../../../errors.js';
import { locator } from '../../../state.js';

/**
 * @param {Parser} parser
 * @returns {Pattern}
 */
export default function read_pattern(parser) {
	const start = parser.index;
	let i = parser.index;

	const name = parser.read_identifier();

	if (name !== null) {
		const annotation = read_type_annotation(parser);

		return {
			type: 'Identifier',
			name,
			start,
			loc: {
				start: /** @type {Location} */ (locator(start)),
				end: /** @type {Location} */ (locator(parser.index))
			},
			end: parser.index,
			typeAnnotation: annotation
		};
	}

	const char = parser.template[i];

	if (char !== '{' && char !== '[') {
		e.expected_pattern(i);
	}

	i = match_bracket(parser, start);
	parser.index = i;

	const pattern_string = parser.template.slice(start, i);

	try {
		// the length of the `space_with_newline` has to be start - 1
		// because we added a `(` in front of the pattern_string,
		// which shifted the entire string to right by 1
		// so we offset it by removing 1 character in the `space_with_newline`
		// to achieve that, we remove the 1st space encountered,
		// so it will not affect the `column` of the node
		let space_with_newline = parser.template
			.slice(0, start)
			.replace(regex_not_newline_characters, ' ');
		const first_space = space_with_newline.indexOf(' ');
		space_with_newline =
			space_with_newline.slice(0, first_space) + space_with_newline.slice(first_space + 1);

		const expression = /** @type {any} */ (
			parse_expression_at(`${space_with_newline}(${pattern_string} = 1)`, parser.ts, start - 1)
		).left;

		expression.typeAnnotation = read_type_annotation(parser);
		if (expression.typeAnnotation) {
			expression.end = expression.typeAnnotation.end;
		}

		return expression;
	} catch (error) {
		parser.acorn_error(error);
	}
}

/**
 * @param {Parser} parser
 * @returns {any}
 */
function read_type_annotation(parser) {
	const start = parser.index;
	parser.allow_whitespace();

	if (!parser.eat(':')) {
		parser.index = start;
		return undefined;
	}

	// we need to trick Acorn into parsing the type annotation
	const insert = '_ as ';
	let a = parser.index - insert.length;
	const template =
		parser.template.slice(0, a).replace(/[^\n]/g, ' ') +
		insert +
		// If this is a type annotation for a function parameter, Acorn-TS will treat subsequent
		// parameters as part of a sequence expression instead, and will then error on optional
		// parameters (`?:`). Therefore replace that sequence with something that will not error.
		parser.template.slice(parser.index).replace(/\?\s*:/g, ':');
	let expression = parse_expression_at(template, parser.ts, a);

	// `foo: bar = baz` gets mangled — fix it
	if (expression.type === 'AssignmentExpression') {
		let b = expression.right.start;
		while (template[b] !== '=') b -= 1;
		expression = parse_expression_at(template.slice(0, b), parser.ts, a);
	}

	// `array as item: string, index` becomes `string, index`, which is mistaken as a sequence expression - fix that
	if (expression.type === 'SequenceExpression') {
		expression = expression.expressions[0];
	}

	parser.index = /** @type {number} */ (expression.end);
	return {
		type: 'TSTypeAnnotation',
		start,
		end: parser.index,
		typeAnnotation: /** @type {any} */ (expression).typeAnnotation
	};
}

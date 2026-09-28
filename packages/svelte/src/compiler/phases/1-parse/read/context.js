/** @import { Pattern } from 'estree' */
/** @import { Parser } from '../index.js' */
import { match_bracket } from '../utils/bracket.js';
import { parse_expression_at, remove_parens } from '../acorn.js';
import * as e from '../../../errors.js';

/**
 * @param {Parser} parser
 * @returns {Pattern}
 */
export default function read_pattern(parser) {
	const start = parser.index;
	let i = parser.index;

	const id = parser.read_identifier();

	if (id.name !== '') {
		const annotation = read_type_annotation(parser);

		return {
			...id,
			typeAnnotation: annotation
		};
	}

	const char = parser.template[i];

	if (char !== '{' && char !== '[') {
		e.expected_pattern(i);
	}

	i = match_bracket(parser, start);
	parser.index = i;

	// acorn never reads before `start`, so the template itself can serve as the prefix
	/** @type {any} */
	let expression = remove_parens(
		parse_expression_at(parser, parser.template.slice(0, i) + ' = 1', start)
	);

	expression = expression.left;

	expression.typeAnnotation = read_type_annotation(parser);
	if (expression.typeAnnotation) {
		expression.end = expression.typeAnnotation.end;
	}

	return expression;
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
		parser.template.slice(0, a) +
		insert +
		// If this is a type annotation for a function parameter, Acorn-TS will treat subsequent
		// parameters as part of a sequence expression instead, and will then error on optional
		// parameters (`?:`). Therefore replace that sequence with something that will not error.
		parser.template.slice(parser.index).replace(/\?\s*:/g, ':');
	let expression = remove_parens(parse_expression_at(parser, template, a));

	// `foo: bar = baz` gets mangled — fix it
	if (expression.type === 'AssignmentExpression') {
		let b = expression.right.start;
		while (template[b] !== '=') b -= 1;
		expression = remove_parens(parse_expression_at(parser, template.slice(0, b), a));
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

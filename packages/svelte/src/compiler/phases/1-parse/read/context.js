/** @import { Pattern } from 'estree' */
/** @import { Parser } from '../index.js' */
import { find_matching_bracket, match_bracket } from '../utils/bracket.js';
import { parse_expression_at, remove_parens, try_parse_expression_from } from '../acorn.js';
import { regex_not_whitespace } from '../../patterns.js';
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
		try_parse_expression_from(parser, parser.template.slice(start, i) + ' = 1', start) ??
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

	/** @param {number} [end] */
	const read_source = (end) =>
		insert +
		// If this is a type annotation for a function parameter, Acorn-TS will treat subsequent
		// parameters as part of a sequence expression instead, and will then error on optional
		// parameters (`?:`). Therefore replace that sequence with something that will not error.
		parser.template.slice(parser.index, end).replace(/\?\s*:/g, ':');

	// the annotation ends inside the tag, so first try reading only up to its closing `}`
	const end = find_matching_bracket(parser.template, parser.index, '{');
	let source = end === undefined ? '' : read_source(end + 1);
	let expression = source ? try_parse_expression_from(parser, source, a) : null;

	if (
		!expression ||
		regex_not_whitespace.test(source.slice(/** @type {number} */ (expression.end) - a, -1))
	) {
		source = read_source();
		expression = parse_expression_at(parser, parser.template.slice(0, a) + source, a);
	}

	expression = remove_parens(expression);

	// `foo: bar = baz` gets mangled — fix it
	if (expression.type === 'AssignmentExpression') {
		let b = expression.right.start;
		while (source[b - a] !== '=') b -= 1;
		source = source.slice(0, b - a);
		expression = remove_parens(
			try_parse_expression_from(parser, source, a) ??
				parse_expression_at(parser, parser.template.slice(0, a) + source, a)
		);
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

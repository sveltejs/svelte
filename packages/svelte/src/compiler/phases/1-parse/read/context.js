/** @import { Expression, Pattern, ObjectPattern, Property, Identifier, RestElement, ArrayPattern } from 'estree' */
/** @import { Parser } from '../index.js' */
import { match_bracket } from '../utils/bracket.js';
import { parse_expression_at } from '../acorn.js';
import { regex_not_newline_characters } from '../../patterns.js';
import * as e from '../../../errors.js';
import { get_loc } from '../../../state.js';

/**
 * @param {Parser} parser
 * @returns {Pattern}
 */
export default function read_pattern(parser) {
	const start = parser.index;
	let i = parser.index;

	if (parser.match('{')) {
		return read_object_pattern(parser);
	}

	if (parser.match('[')) {
		return read_array_pattern(parser);
	}

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

	i = match_bracket(parser.template, start, char, char === '{' ? '}' : ']');
	parser.index = i;

	const pattern_string = parser.template.slice(start, i);

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

	/** @type {any} */
	let expression = parse_expression_at(
		parser,
		`${space_with_newline}(${pattern_string} = 1)`,
		start - 1
	);

	expression = expression.left;

	expression.typeAnnotation = read_type_annotation(parser);
	if (expression.typeAnnotation) {
		expression.end = expression.typeAnnotation.end;
	}

	parser.index = expression.end;

	return expression;
}

/**
 * @param {Parser} parser
 * @returns {ObjectPattern}
 */
function read_object_pattern(parser) {
	const start = parser.index;

	parser.eat('{', true);

	/** @type {Array<Property | RestElement>} */
	const properties = [];

	/** @type {ObjectPattern} */
	const pattern = {
		type: 'ObjectPattern',
		start,
		end: -1,
		// @ts-ignore I think the ESTree types might just be wrong here?
		properties
	};

	while (true) {
		parser.allow_whitespace();

		const start = parser.index;

		if (parser.match('}')) {
			// can end up here if last element had a trailing comma
			break;
		}

		if (parser.eat('...')) {
			parser.allow_whitespace();
			const argument = parser.read_identifier();

			properties.push({
				type: 'RestElement',
				start,
				end: argument.end,
				argument,
				loc: get_loc(start, argument.end)
			});

			parser.allow_whitespace();

			break;
		}

		const computed = parser.eat('[');
		const key = computed
			? /** @type {Expression} */ (parse_expression_at(parser, parser.template, parser.index))
			: parser.read_identifier();
		if (computed) parser.eat(']', true);

		/** @type {Property} */
		const property = {
			type: 'Property',
			start,
			end: -1,
			key,
			value: /** @type {Identifier} */ (key),
			method: false,
			shorthand: true,
			computed,
			kind: 'init'
		};

		parser.allow_whitespace();

		if (parser.eat(':', computed)) {
			property.value = read_pattern(parser);
			property.shorthand = false;
		}

		parser.allow_whitespace();

		if (parser.eat('=')) {
			parser.allow_whitespace();
			const start = parser.index;

			let right = /** @type {Expression} */ (
				parse_expression_at(parser, parser.template, parser.index)
			);

			if (right.type === 'SequenceExpression' && right.start === start) {
				right = right.expressions[0];
				parser.index = /** @type {number} */ (right.end);
			}

			property.value = {
				type: 'AssignmentPattern',
				start: property.value.start,
				end: right.end,
				left: /** @type {Pattern} */ (property.value),
				right,
				loc: get_loc(property.value.start, right.end)
			};
		}

		if (parser.ts) {
			property.typeAnnotation = read_type_annotation(parser);
		}

		property.end = parser.index;

		property.loc = get_loc(start, property.end);

		properties.push(property);

		parser.allow_whitespace();

		if (!parser.eat(',')) {
			break;
		}
	}

	parser.allow_whitespace();
	parser.eat('}', true);
	pattern.end = parser.index;

	pattern.loc = get_loc(start, parser.index);

	return pattern;
}

/**
 * @param {Parser} parser
 * @returns {ArrayPattern}
 */
function read_array_pattern(parser) {
	const start = parser.index;

	parser.eat('[', true);

	/** @type {Pattern[]} */
	const elements = [];

	/** @type {ArrayPattern} */
	const pattern = {
		type: 'ArrayPattern',
		start,
		end: -1,
		elements
	};

	while (true) {
		parser.allow_whitespace();

		const start = parser.index;

		if (parser.match('}')) {
			// can end up here if last element had a trailing comma
			break;
		}

		if (parser.eat('...')) {
			parser.allow_whitespace();
			const argument = parser.read_identifier();

			elements.push({
				type: 'RestElement',
				start,
				end: argument.end,
				argument,
				loc: get_loc(start, argument.end)
			});

			parser.allow_whitespace();

			break;
		}

		let element = read_pattern(parser);

		parser.allow_whitespace();

		if (parser.eat('=')) {
			parser.allow_whitespace();
			const start = parser.index;

			let right = /** @type {Expression} */ (
				parse_expression_at(parser, parser.template, parser.index)
			);

			if (right.type === 'SequenceExpression' && right.start === start) {
				right = right.expressions[0];
				parser.index = /** @type {number} */ (right.end);
			}

			element = {
				type: 'AssignmentPattern',
				start: element.start,
				end: right.end,
				left: /** @type {Pattern} */ (element),
				right,
				loc: get_loc(element.start, right.end)
			};
		}

		if (parser.ts) {
			element.typeAnnotation = read_type_annotation(parser);
		}

		element.end = parser.index;

		element.loc = get_loc(start, element.end);

		elements.push(element);

		parser.allow_whitespace();

		if (!parser.eat(',')) {
			break;
		}
	}

	parser.allow_whitespace();
	parser.eat(']', true);
	pattern.end = parser.index;

	pattern.loc = get_loc(start, parser.index);

	return pattern;
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
	let expression = parse_expression_at(parser, template, a);

	// `foo: bar = baz` gets mangled — fix it
	if (expression.type === 'AssignmentExpression') {
		let b = expression.right.start;
		while (template[b] !== '=') b -= 1;
		expression = parse_expression_at(parser, template.slice(0, b), a);
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

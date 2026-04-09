/** @import { Expression, Pattern, ObjectPattern, Property, Identifier, RestElement, ArrayPattern } from 'estree' */
/** @import { Parser } from '../index.js' */
import { parse_expression_at } from '../acorn.js';
import { get_loc } from '../../../state.js';

/**
 * @param {Parser} parser
 * @returns {Pattern}
 */
export default function read_pattern(parser) {
	if (parser.match('{')) {
		return read_object_pattern(parser);
	}

	if (parser.match('[')) {
		return read_array_pattern(parser);
	}

	const id = parser.read_identifier();

	const annotation = read_type_annotation(parser);

	return {
		...id,
		typeAnnotation: annotation
	};
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
		parser.advance();

		const start = parser.index;

		if (parser.match('}')) {
			// can end up here if last element had a trailing comma
			break;
		}

		if (parser.eat('...')) {
			parser.advance();
			const argument = parser.read_identifier();

			properties.push({
				type: 'RestElement',
				start,
				end: argument.end,
				argument,
				loc: get_loc(start, argument.end)
			});

			parser.advance();

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

		parser.advance();

		if (parser.eat(':', computed)) {
			property.value = read_pattern(parser);
			property.shorthand = false;
		}

		parser.advance();

		if (parser.eat('=')) {
			parser.advance();
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

		parser.advance();

		if (!parser.eat(',')) {
			break;
		}
	}

	parser.advance();
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
		parser.advance();

		const start = parser.index;

		if (parser.match('}')) {
			// can end up here if last element had a trailing comma
			break;
		}

		if (parser.eat('...')) {
			parser.advance();
			const argument = parser.read_identifier();

			elements.push({
				type: 'RestElement',
				start,
				end: argument.end,
				argument,
				loc: get_loc(start, argument.end)
			});

			parser.advance();

			break;
		}

		let element = read_pattern(parser);

		parser.advance();

		if (parser.eat('=')) {
			parser.advance();
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

		parser.advance();

		if (!parser.eat(',')) {
			break;
		}
	}

	parser.advance();
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

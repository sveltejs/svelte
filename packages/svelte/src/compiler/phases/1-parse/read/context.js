// @ts-expect-error acorn type definitions are borked in the release we use
import { isIdentifierStart } from 'acorn';
import full_char_code_at from '../utils/full_char_code_at.js';
import {
	is_bracket_open,
	is_bracket_close,
	is_bracket_pair,
	get_bracket_close
} from '../utils/bracket.js';
import { parse_expression_at } from '../acorn.js';
import { regex_not_newline_characters } from '../../patterns.js';
import { error } from '../../../errors.js';

/**
 * @param {import('../index.js').Parser} parser
 * @returns {import('estree').Pattern}
 */
export default function read_pattern(parser) {
	const start = parser.index;
	let i = parser.index;

	const code = full_char_code_at(parser.template, i);
	if (isIdentifierStart(code, true)) {
		const name = /** @type {string} */ (parser.read_identifier());
		const annotation = read_type_annotation(parser);

		return {
			type: 'Identifier',
			name,
			start,
			end: parser.index,
			typeAnnotation: annotation
		};
	}

	if (!is_bracket_open(code)) {
		error(i, 'expected-pattern');
	}

	const bracket_stack = [code];
	i += code <= 0xffff ? 1 : 2;

	while (i < parser.template.length) {
		const code = full_char_code_at(parser.template, i);
		if (is_bracket_open(code)) {
			bracket_stack.push(code);
		} else if (is_bracket_close(code)) {
			const popped = /** @type {number} */ (bracket_stack.pop());
			if (!is_bracket_pair(popped, code)) {
				error(
					i,
					'expected-token',
					String.fromCharCode(/** @type {number} */ (get_bracket_close(popped)))
				);
			}
			if (bracket_stack.length === 0) {
				i += code <= 0xffff ? 1 : 2;
				break;
			}
		}
		i += code <= 0xffff ? 1 : 2;
	}

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
 * @param {import('../index.js').Parser} parser
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
		parser.template.slice(parser.index);
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

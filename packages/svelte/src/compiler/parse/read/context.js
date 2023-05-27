import { isIdentifierStart } from 'acorn';
import full_char_code_at from '../../utils/full_char_code_at.js';
import {
	is_bracket_open,
	is_bracket_close,
	is_bracket_pair,
	get_bracket_close
} from '../utils/bracket.js';
import { parse_expression_at } from '../acorn.js';
import parser_errors from '../errors.js';
import { regex_not_newline_characters } from '../../utils/patterns.js';

/**
 * @param {import('../index.js').Parser} parser
 * @returns {import('estree').Pattern & { start: number; end: number }}
 */
export default function read_context(parser) {
	const start = parser.index;
	let i = parser.index;

	const code = full_char_code_at(parser.template, i);
	if (isIdentifierStart(code, true)) {
		return {
			type: 'Identifier',
			name: parser.read_identifier(),
			start,
			end: parser.index
		};
	}

	if (!is_bracket_open(code)) {
		parser.error(parser_errors.unexpected_token_destructure);
	}

	const bracket_stack = [code];
	i += code <= 0xffff ? 1 : 2;

	while (i < parser.template.length) {
		const code = full_char_code_at(parser.template, i);
		if (is_bracket_open(code)) {
			bracket_stack.push(code);
		} else if (is_bracket_close(code)) {
			if (!is_bracket_pair(bracket_stack[bracket_stack.length - 1], code)) {
				parser.error(
					parser_errors.unexpected_token(
						String.fromCharCode(get_bracket_close(bracket_stack[bracket_stack.length - 1]))
					)
				);
			}
			bracket_stack.pop();
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

		return /** @type {any} */ (
			parse_expression_at(`${space_with_newline}(${pattern_string} = 1)`, start - 1)
		).left;
	} catch (error) {
		parser.acorn_error(error);
	}
}

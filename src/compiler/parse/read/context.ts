import { Parser } from "../index";
import { isIdentifierStart } from "acorn";
import full_char_code_at from "../../utils/full_char_code_at";
import {
	is_bracket_open,
	is_bracket_close,
	is_bracket_pair,
	get_bracket_close
} from "../utils/bracket";
import { parse_expression_at } from "../acorn";
import { Pattern } from "estree";

export default function read_context(parser: Parser): Pattern {
	const start = parser.index;
	let i = parser.index;

	const code = full_char_code_at(parser.template, i);
	if (isIdentifierStart(code, true)) {
		return { type: "Identifier", name: parser.read_identifier() };
	}

	if (!is_bracket_open(code)) {
		parser.error({
			code: "unexpected-token",
			message: "Expected identifier or destructure pattern"
		});
	}

	const bracket_stack = [code];
	i += code <= 0xffff ? 1 : 2;

	while (i < parser.template.length) {
		const code = full_char_code_at(parser.template, i);
		if (is_bracket_open(code)) {
			bracket_stack.push(code);
		} else if (is_bracket_close(code)) {
			if (!is_bracket_pair(bracket_stack[bracket_stack.length - 1], code)) {
				parser.error({
					code: "unexpected-token",
					message: `Expected ${String.fromCharCode(
						get_bracket_close(bracket_stack[bracket_stack.length - 1])
					)}`
				});
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
	return (parse_expression_at(`${' '.repeat(start - 1)}(${pattern_string} = 1)`, start - 1) as any)
		.left as Pattern;
}

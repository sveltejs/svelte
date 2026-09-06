/** @import { Expression, Identifier } from 'estree' */
/** @import { Parser } from '../index.js' */
import { isIdentifierStart, isIdentifierChar } from '@teasel/parser';
import { parse_expression_at } from '../js.js';
import { regex_whitespace } from '../../patterns.js';
import * as e from '../../../errors.js';
import { find_matching_bracket } from '../utils/bracket.js';
import { is_reserved } from '../../../../utils.js';
import { locator } from '../../../state.js';

/**
 * @param {Parser} parser
 * @param {string} [opening_token]
 * @returns {Expression | undefined}
 */
export function get_loose_identifier(parser, opening_token) {
	// Find the next } and treat it as the end of the expression
	const end = find_matching_bracket(parser.template, parser.index, opening_token ?? '{');
	if (end) {
		const start = parser.index;
		parser.index = end;
		// We don't know what the expression is and signal this by returning an empty identifier
		return {
			type: 'Identifier',
			start,
			end,
			name: ''
		};
	}
}

/**
 * @param {Parser} parser
 * @param {string} [opening_token]
 * @param {boolean} [disallow_loose]
 * @param {'as'} [until] the host's `as` follows the expression, as an each block's item does
 * @returns {Expression}
 */
export default function read_expression(parser, opening_token, disallow_loose, until) {
	const simple = read_simple_expression(parser);
	if (simple) return simple;

	try {
		const { node, end } = parse_expression_at(parser, parser.index, until);
		parser.index = end;
		return node;
	} catch (err) {
		// If we are in an each loop we need the error to be thrown in cases like
		// `as { y = z }` so we still throw and handle the error there
		if (parser.loose && !disallow_loose) {
			const expression = get_loose_identifier(parser, opening_token);
			if (expression) {
				return expression;
			}
		}

		throw err;
	}
}

const regex_non_lf_line_break = /\r(?!\n)|[\u2028\u2029]/;

let last_template = '';
let lf_only = true;

/**
 * The parser breaks lines on bare `\r`, `\u2028` and `\u2029`, which the locator doesn't
 * @param {Parser} parser
 */
function has_lf_line_breaks_only(parser) {
	if (parser.template !== last_template) {
		last_template = parser.template;
		lf_only = !regex_non_lf_line_break.test(last_template);
	}
	return lf_only;
}

/**
 * Most template expressions are an identifier or a `a.b.c` member chain followed by `}`.
 * Those are built directly for better parse performance, with the same shape the parser would produce; anything else goes to the parser
 * @param {Parser} parser
 * @returns {Expression | null}
 */
function read_simple_expression(parser) {
	if (!has_lf_line_breaks_only(parser)) return null;

	const template = parser.template;
	const index = parser.index;

	parser.allow_whitespace();
	const start = parser.index;

	let end = read_word(template, start);
	if (end === -1 || is_reserved(template.slice(start, end))) {
		parser.index = index;
		return null;
	}

	/** @type {Expression} */
	let node = identifier(template, start, end);

	while (template[end] === '.') {
		const property_end = read_word(template, end + 1);
		if (property_end === -1) {
			parser.index = index;
			return null;
		}

		node = {
			type: 'MemberExpression',
			start,
			end: property_end,
			loc: { start: position(start), end: position(property_end) },
			object: node,
			property: identifier(template, end + 1, property_end),
			computed: false,
			optional: false
		};

		end = property_end;
	}

	parser.index = end;
	parser.allow_whitespace();

	if (!parser.match('}')) {
		parser.index = index;
		return null;
	}

	parser.index = end;
	return node;
}

/**
 * @param {string} template
 * @param {number} start
 * @returns {number} the end of the identifier starting at `start`, or -1
 */
function read_word(template, start) {
	if (start >= template.length) return -1;

	const code = /** @type {number} */ (template.codePointAt(start));
	if (!isIdentifierStart(code)) return -1;

	let end = start + (code <= 0xffff ? 1 : 2);

	while (end < template.length) {
		const code = /** @type {number} */ (template.codePointAt(end));
		if (!isIdentifierChar(code)) break;
		end += code <= 0xffff ? 1 : 2;
	}

	return end;
}

/**
 * @param {string} template
 * @param {number} start
 * @param {number} end
 * @returns {Identifier}
 */
function identifier(template, start, end) {
	return {
		type: 'Identifier',
		start,
		end,
		loc: { start: position(start), end: position(end) },
		name: template.slice(start, end)
	};
}

/** @param {number} index */
function position(index) {
	const { line, column } = locator(index);
	return { line, column };
}

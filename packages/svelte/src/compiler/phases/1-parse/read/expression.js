/** @import { Expression, Identifier } from 'estree' */
/** @import { Parser } from '../index.js' */
// @ts-expect-error acorn type definitions are borked in the release we use
import { isIdentifierStart, isIdentifierChar } from 'acorn';
import { has_lf_line_breaks_only, parse_expression_at, remove_parens } from '../acorn.js';
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
 * @returns {Expression}
 */
export default function read_expression(parser, opening_token, disallow_loose) {
	const simple = read_simple_expression(parser);
	if (simple) return simple;

	try {
		const node = parse_expression_at(parser, parser.template, parser.index);

		let index = /** @type {number} */ (node.end);

		const last_comment = parser.root.comments.at(-1);
		if (last_comment && last_comment.end > index) index = last_comment.end;

		parser.index = index;

		return /** @type {Expression} */ (remove_parens(node));
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

/**
 * Most template expressions are an identifier or a `a.b.c` member chain followed by `}`.
 * Those are built directly for better parse performance, with the same shape acorn would produce; anything else goes to acorn
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
	if (!isIdentifierStart(code, true)) return -1;

	let end = start + (code <= 0xffff ? 1 : 2);

	while (end < template.length) {
		const code = /** @type {number} */ (template.codePointAt(end));
		if (!isIdentifierChar(code, true)) break;
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

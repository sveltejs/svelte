/** @import { Expression, Pattern, Program, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { Parser } from './index.js' */
import * as teasel from '@teasel/parser';
import * as e from '../../errors.js';

/**
 * @param {string} source
 * @param {AST.JSComment[]} comments
 * @param {boolean} typescript
 * @param {boolean} [is_script] a `<script>` may export names the component declares elsewhere
 * @returns {Program}
 */
export function parse(source, comments, typescript, is_script) {
	try {
		const ast = teasel.parse(source, {
			sourceType: 'module',
			typescript,
			comments: true,
			locations: true,
			allowUndeclaredExports: is_script
		});

		add_comments(source, comments, /** @type {teasel.Comment[]} */ (ast.comments));
		delete ast.comments;

		return ast;
	} catch (err) {
		return handle_parse_error(err);
	}
}

/**
 * @param {Parser} parser
 * @param {number} index
 * @param {'as' | 'in'} [until] a word operator the expression stops before, at the top level
 * @returns {{ node: Expression, end: number }}
 */
export function parse_expression_at(parser, index, until) {
	try {
		const { node, end, comments } = parser.js.parseExpressionAt(index, until);
		add_comments(parser.template, parser.root.comments, /** @type {teasel.Comment[]} */ (comments));
		return { node, end };
	} catch (err) {
		return handle_parse_error(err);
	}
}

/**
 * @param {Parser} parser
 * @param {number} index
 * @returns {{ node: Pattern, end: number }}
 */
export function parse_pattern_at(parser, index) {
	try {
		const { node, end, comments } = parser.js.parsePatternAt(index);
		add_comments(parser.template, parser.root.comments, /** @type {teasel.Comment[]} */ (comments));
		return { node, end };
	} catch (err) {
		return handle_parse_error(err);
	}
}

/**
 * @param {Parser} parser
 * @param {string} source
 * @param {number} index the opening paren
 * @returns {{ params: Pattern[], end: number }}
 */
export function parse_params_at(parser, index) {
	try {
		const { params, end, comments } = parser.js.parseParamsAt(index);
		add_comments(parser.template, parser.root.comments, /** @type {teasel.Comment[]} */ (comments));
		return { params, end };
	} catch (err) {
		return handle_parse_error(err);
	}
}

/**
 * @param {Parser} parser
 * @param {number} index
 * @returns {{ node: Statement, end: number }}
 */
export function parse_statement_at(parser, index) {
	try {
		const { node, end, comments } = parser.js.parseStatementAt(index);
		add_comments(parser.template, parser.root.comments, /** @type {teasel.Comment[]} */ (comments));
		return { node, end };
	} catch (err) {
		// A statement that runs to the end of the source (e.g. an unterminated declaration tag)
		// is an EOF, not a stray token; preserve the friendlier `unexpected_eof` diagnostic.
		if (/** @type {any} */ (err).pos === parser.template.length)
			e.unexpected_eof(parser.template.length);
		return handle_parse_error(err);
	}
}

const regex_position_indicator = / \(\d+:\d+\)$/;

/**
 * @param {any} err
 * @returns {never}
 */
function handle_parse_error(err) {
	e.js_parse_error(err.pos, err.message.replace(regex_position_indicator, ''));
}

/**
 * Comments are needed in order to support `svelte-ignore` comments in JS code and so that
 * `prettier-plugin-svelte` doesn't remove all comments when formatting. A block comment loses
 * the indentation of the line it starts on.
 * @param {string} source
 * @param {AST.JSComment[]} comments
 * @param {teasel.Comment[]} parsed
 */
function add_comments(source, comments, parsed) {
	for (const comment of parsed) {
		if (comment.type === 'Block' && comment.value.includes('\n')) {
			let a = comment.start;
			while (a > 0 && source[a - 1] !== '\n') a -= 1;

			let b = a;
			while (/[ \t]/.test(source[b])) b += 1;

			const indentation = source.slice(a, b);
			comment.value = comment.value.replace(new RegExp(`^${indentation}`, 'gm'), '');
		}

		comments.push(/** @type {AST.JSComment} */ (comment));
	}
}

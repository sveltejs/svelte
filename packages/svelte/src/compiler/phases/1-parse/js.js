/** @import { Expression, Pattern, Program, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { Parser } from './index.js' */
import * as teasel from '@teasel/parser';
import * as e from '../../errors.js';

/**
 * A standalone module, as `analyze_module` reads one.
 * @param {string} source
 * @param {AST.JSComment[]} comments
 * @param {boolean} typescript
 * @returns {Program}
 */
export function parse(source, comments, typescript) {
	let ast;
	try {
		ast = teasel.parse(source, {
			sourceType: 'module',
			typescript,
			comments: true,
			locations: true,
			scopes: true
		});
	} catch (err) {
		return handle_parse_error(err);
	}

	add_comments(source, comments, /** @type {teasel.Comment[]} */ (ast.comments));
	delete ast.comments;
	delete ast.scopes;
	delete ast.bindings;

	return ast;
}

/**
 * The program inside a `<script>`, with the positions of the whole template.
 * @param {Parser} parser
 * @param {number} start
 * @param {number} end
 * @returns {Program}
 */
export function parse_script(parser, start, end) {
	let ast;
	try {
		ast = parser.js.parse(start, end);
	} catch (err) {
		return handle_parse_error(err);
	}

	add_comments(
		parser.template,
		parser.root.comments,
		/** @type {teasel.Comment[]} */ (ast.comments)
	);
	delete ast.comments;
	delete ast.scopes;
	delete ast.bindings;
	unsupported(ast.typescript);
	delete ast.typescript;

	return ast;
}

/**
 * @param {Parser} parser
 * @param {number} index
 * @param {'as'} [until] the host's `as` follows the expression, as an each block's item does
 * @returns {{ node: Expression, end: number }}
 */
export function parse_expression_at(parser, index, until) {
	let answer;
	try {
		answer = parser.js.parseExpressionAt(index, until);
	} catch (err) {
		return handle_parse_error(err);
	}

	return accept(parser, answer, answer.node);
}

/**
 * @param {Parser} parser
 * @param {number} index
 * @returns {{ node: Pattern, end: number }}
 */
export function parse_pattern_at(parser, index) {
	let answer;
	try {
		answer = parser.js.parsePatternAt(index);
	} catch (err) {
		return handle_parse_error(err);
	}

	return accept(parser, answer, answer.node);
}

/**
 * @param {Parser} parser
 * @param {number} index the opening paren
 * @returns {{ node: Pattern[], end: number }}
 */
export function parse_params_at(parser, index) {
	let answer;
	try {
		answer = parser.js.parseParamsAt(index);
	} catch (err) {
		return handle_parse_error(err);
	}

	return accept(parser, answer, answer.params);
}

/**
 * @param {Parser} parser
 * @param {number} index
 * @returns {{ node: Statement, end: number }}
 */
export function parse_statement_at(parser, index) {
	let answer;
	try {
		answer = parser.js.parseStatementAt(index);
	} catch (err) {
		if (/** @type {any} */ (err).code === 'unexpected_eof') e.unexpected_eof(parser.template.length);
		return handle_parse_error(err);
	}

	return accept(parser, answer, answer.node);
}

/**
 * Keeps an answer's comments, rejects what erasure could not express, and hands back the node
 * with the offset the parse stopped at.
 * @template T
 * @param {Parser} parser
 * @param {{ end: number, comments?: teasel.Comment[], typescript?: teasel.Kept[] }} answer
 * @param {T} node
 * @returns {{ node: T, end: number }}
 */
function accept(parser, answer, node) {
	add_comments(
		parser.template,
		parser.root.comments,
		/** @type {teasel.Comment[]} */ (answer.comments)
	);
	unsupported(answer.typescript);
	return { node, end: answer.end };
}

/** What erasure leaves in place needs a compiler, not this one */
const UNSUPPORTED = {
	TSEnumDeclaration: 'enums',
	TSModuleDeclaration: 'namespaces with non-type nodes',
	TSParameterProperty: 'accessibility modifiers on constructor parameters',
	Decorator: 'decorators (related TSC proposal is not stage 4 yet)',
	AccessorProperty: 'accessor fields (related TSC proposal is not stage 4 yet)',
	TSExportAssignment: 'export assignments',
	TSImportEqualsDeclaration: 'import assignments'
};

/** @param {teasel.Kept[] | undefined} kept */
function unsupported(kept) {
	const node = kept?.[0];
	if (node) {
		e.typescript_invalid_feature(
			node,
			UNSUPPORTED[/** @type {keyof typeof UNSUPPORTED} */ (node.type)] ?? node.type
		);
	}
}

/**
 * @param {any} err
 * @returns {never}
 */
function handle_parse_error(err) {
	e.js_parse_error(err.pos, err.message);
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

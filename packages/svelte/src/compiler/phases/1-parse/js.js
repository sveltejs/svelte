/** @import { Expression, Pattern, Program, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { Parser } from './index.js' */
import * as teasel from '@teasel/parser';
import * as e from '../../errors.js';
import { find_matching_bracket } from './utils/bracket.js';

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
 * Reads JavaScript at the cursor with the template's parser and moves the cursor past it.
 * @template {{ end: number, comments?: teasel.Comment[], typescript?: teasel.Kept[] }} T
 * @param {Parser} parser
 * @param {(js: teasel.Source) => T} run
 * @returns {T}
 */
function read(parser, run) {
	let answer;
	try {
		answer = run(parser.js);
	} catch (err) {
		// the parser's syntax errors; a compile error thrown while reading is the host's own
		if (!(err instanceof SyntaxError)) throw err;
		return handle_parse_error(err);
	}

	add_comments(
		parser.template,
		parser.root.comments,
		/** @type {teasel.Comment[]} */ (answer.comments)
	);
	unsupported(answer.typescript);
	parser.index = answer.end;

	return answer;
}

/**
 * @param {Parser} parser
 * @param {'as'} [until] the host's `as` follows the expression, as an each block's item does
 * @param {string} [opening_token] the bracket the expression sits in, for loose mode
 * @returns {Expression}
 */
export function read_expression(parser, until, opening_token = '{') {
	const start = parser.index;

	try {
		return read(parser, (js) => js.parseExpressionAt(start, until)).node;
	} catch (err) {
		if (parser.loose) {
			// Find the next } and treat it as the end of the expression
			const end = find_matching_bracket(parser.template, start, opening_token);
			if (end !== undefined) {
				parser.index = end;
				// We don't know what the expression is and signal this by returning an empty identifier
				return { type: 'Identifier', start, end, name: '' };
			}
		}

		throw err;
	}
}

/**
 * @param {Parser} parser
 * @returns {Pattern}
 */
export function read_pattern(parser) {
	const start = parser.index;

	const id = parser.read_identifier();

	if (id.name !== '') {
		const after = parser.index;
		parser.allow_whitespace();

		// a type annotation makes it a job for the parser
		if (!parser.match(':')) {
			parser.index = after;
			return id;
		}
	} else {
		const char = parser.template[start];

		if (char !== '{' && char !== '[') {
			e.expected_pattern(start);
		}
	}

	return read(parser, (js) => js.parsePatternAt(start)).node;
}

/**
 * @param {Parser} parser at the opening paren
 * @returns {Pattern[]}
 */
export function read_params(parser) {
	const start = parser.index;
	return read(parser, (js) => js.parseParamsAt(start)).params;
}

/**
 * @param {Parser} parser
 * @returns {Statement}
 */
export function read_statement(parser) {
	const start = parser.index;

	return read(parser, (js) => {
		try {
			return js.parseStatementAt(start);
		} catch (err) {
			if (/** @type {any} */ (err).code === 'unexpected_eof')
				e.unexpected_eof(parser.template.length);
			throw err;
		}
	}).node;
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

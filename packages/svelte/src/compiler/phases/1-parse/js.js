/** @import { Expression, Pattern, Program, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { Parser } from './index.js' */
import * as teasel from '@teasel/parser';
import * as e from '../../errors.js';
import { keep_tables } from '../../utils/ast.js';

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
	keep_tables(ast, tables(ast));

	return ast;
}

/**
 * Takes the tables off an answer, so they reach the scope analysis without showing in the tree.
 * @param {{ scopes?: any; bindings?: any; references?: any }} answer
 */
function tables(answer) {
	const { scopes, bindings, references } = answer;
	delete answer.scopes;
	delete answer.bindings;
	delete answer.references;
	return { scopes, bindings, references };
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
	delete ast.errors;
	keep_tables(ast, tables(ast));
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
 * @param {string[]} [stop_at] the template's own tokens after the expression, which end it
 * @returns {Expression}
 */
export function read_expression(parser, stop_at) {
	const start = parser.index;
	const answer = read(parser, (js) => js.parseExpressionAt(start, stop_at));
	keep_tables(answer.node, tables(answer));
	const node = answer.node;
	// the language tools copy an expression's text by its node's range, so the placeholder standing for one that could not be read spans what was read
	if (node.type === 'Identifier' && node.name === '' && node.start === node.end) {
		node.start = start;
		node.end = answer.end;
	}
	return node;
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

	const answer = read(parser, (js) => js.parsePatternAt(start));
	keep_tables(answer.node, tables(answer));
	return answer.node;
}

/**
 * @param {Parser} parser at the opening paren
 * @returns {Pattern[]}
 */
export function read_params(parser) {
	const start = parser.index;
	const answer = read(parser, (js) => js.parseParamsAt(start));
	keep_tables(answer.params, tables(answer));
	return answer.params;
}

/**
 * @param {Parser} parser at the opening `<`
 */
export function read_type_parameters(parser) {
	const start = parser.index;
	read(parser, (js) => js.parseTypeParametersAt(start));
}

/**
 * @param {Parser} parser
 * @returns {Statement}
 */
export function read_statement(parser) {
	const start = parser.index;

	const answer = read(parser, (js) => js.parseStatementAt(start));
	keep_tables(answer.node, tables(answer));
	return answer.node;
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
	if (err.code === 'unexpected_eof') e.unexpected_eof(err.pos);
	e.js_parse_error({ start: err.pos, end: err.end }, err.message);
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

/** @import { Program } from 'estree' */
/** @import { AST } from '#compiler' */
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
	let answer;
	try {
		answer = new teasel.Source(source, {
			sourceType: 'module',
			typescript,
			comments: true,
			locations: true,
			scopes: true
		}).parse();
	} catch (err) {
		return handle_parse_error(err);
	}

	for (const comment of /** @type {teasel.Comment[]} */ (answer.comments)) {
		dedent(comment, source);
		comments.push(/** @type {AST.JSComment} */ (comment));
	}
	keep_tables(answer.node, answer);

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
export function unsupported(kept) {
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
 * @param {teasel.Comment} comment
 * @param {string} source
 */
export function dedent(comment, source) {
	if (comment.type === 'Block' && comment.value.includes('\n')) {
		let a = comment.start;
		while (a > 0 && source[a - 1] !== '\n') a -= 1;

		let b = a;
		while (/[ \t]/.test(source[b])) b += 1;

		const indentation = source.slice(a, b);
		comment.value = comment.value.replace(new RegExp(`^${indentation}`, 'gm'), '');
	}
}

/** @import { Node, Program } from 'estree' */
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
	copy_attached([answer.node], /** @type {AST.JSComment[]} */ (answer.comments), !!typescript);
	// a module read on its own is one piece: its program, in its own scope
	const scopes = /** @type {teasel.Scope[]} */ (answer.scopes);
	keep_tables(answer.node, {
		node: answer.node,
		scope: scopes[0],
		scopes: scopes.slice(1),
		bindings: /** @type {teasel.Binding[]} */ (answer.bindings),
		references: /** @type {teasel.Reference[]} */ (answer.references)
	});

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
	e.js_parse_error(err.pos, err.message);
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

const ATTACHED = /** @type {const} */ (['leadingComments', 'trailingComments', 'innerComments']);

/**
 * A node's comments are copies of the listed ones without their locations, as acorn's attachment made them.
 * @param {Node[]} pieces
 * @param {AST.JSComment[]} comments the listed comments, dedented, in source order
 * @param {boolean} typescript
 */
export function copy_attached(pieces, comments, typescript) {
	if (comments.length === 0) return;
	const listed = new Map(comments.map((comment) => [comment.start, comment]));
	const { children, extras } = teasel.js;

	/**
	 * @param {any} node
	 * @param {number} low
	 * @param {number} high what lies between the node's siblings: the only comments its subtree can carry
	 */
	function visit(node, low, high) {
		if (node === null || typeof node !== 'object') return;
		if (Array.isArray(node)) {
			for (let i = 0; i < node.length; i += 1) {
				const before = i === 0 ? low : node[i - 1]?.end ?? low;
				const after = i === node.length - 1 ? high : node[i + 1]?.start ?? high;
				visit(node[i], before, after);
			}
			return;
		}
		for (const key of ATTACHED) {
			const list = /** @type {AST.JSComment[] | undefined} */ (node[key]);
			if (list === undefined) continue;
			node[key] = list.map((comment) => {
				const read = listed.get(comment.start);
				// the comment before a `<script>` that the compiler puts on its program has no place in the source
				if (read === undefined) return comment;
				return { type: comment.type, value: read.value, start: comment.start, end: comment.end };
			});
		}
		const first = comments[first_from(comments, low)];
		if (first === undefined || first.start >= high) return;
		for (const key of children[node.type] ?? []) visit(node[key], low, high);
		if (typescript) for (const key of extras) visit(node[key], low, high);
	}

	for (const piece of pieces) {
		visit(piece, /** @type {any} */ (piece).start, /** @type {any} */ (piece).end);
	}
}

/**
 * The index of the first comment at or after `start`.
 * @param {AST.JSComment[]} comments in source order
 * @param {number} start
 */
export function first_from(comments, start) {
	let low = 0;
	let high = comments.length;
	while (low < high) {
		const middle = (low + high) >>> 1;
		if (comments[middle].start < start) low = middle + 1;
		else high = middle;
	}
	return low;
}

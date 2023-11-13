import * as acorn from 'acorn';
import { walk } from 'zimmerframe';

/**
 * @param {string} source
 */
export function parse(source) {
	const { onComment, add_comments } = get_comment_handlers(source);
	const ast = acorn.parse(source, {
		onComment,
		sourceType: 'module',
		ecmaVersion: 13,
		locations: true
	});
	add_comments(ast);
	return /** @type {import('estree').Program} */ (ast);
}

/**
 * @param {string} source
 * @param {number} index
 */
export function parse_expression_at(source, index) {
	const { onComment, add_comments } = get_comment_handlers(source);
	const ast = acorn.parseExpressionAt(source, index, {
		onComment,
		sourceType: 'module',
		ecmaVersion: 13,
		locations: true
	});
	add_comments(ast);
	return /** @type {import('estree').Expression} */ (ast);
}

/**
 * Acorn doesn't add comments to the AST by itself. This factory returns the capabilities
 * to add them after the fact. They are needed in order to support `svelte-ignore` comments
 * in JS code and so that `prettier-plugin-svelte` doesn't remove all comments when formatting.
 * @param {string} source
 */
export function get_comment_handlers(source) {
	/**
	 * @typedef {import('estree').Comment & {
	 *   start: number;
	 *   end: number;
	 *   has_trailing_newline?: boolean
	 * }} CommentWithLocation
	 */

	/** @type {CommentWithLocation[]} */
	const comments = [];

	return {
		/**
		 * @param {boolean} block
		 * @param {string} value
		 * @param {number} start
		 * @param {number} end
		 */
		onComment: (block, value, start, end) => {
			if (block && /\n/.test(value)) {
				let a = start;
				while (a > 0 && source[a - 1] !== '\n') a -= 1;

				let b = a;
				while (/[ \t]/.test(source[b])) b += 1;

				const indentation = source.slice(a, b);
				value = value.replace(new RegExp(`^${indentation}`, 'gm'), '');
			}

			comments.push({ type: block ? 'Block' : 'Line', value, start, end });
		},

		/** @param {acorn.Node & { leadingComments?: CommentWithLocation[]; trailingComments?: CommentWithLocation[]; }} ast */
		add_comments(ast) {
			if (comments.length === 0) return;

			walk(
				ast,
				{},
				{
					_(node, { next }) {
						let comment;

						while (comments[0] && comments[0].start < node.start) {
							comment = /** @type {CommentWithLocation} */ (comments.shift());

							const next = comments[0] || node;
							comment.has_trailing_newline =
								comment.type === 'Line' || /\n/.test(source.slice(comment.end, next.start));

							(node.leadingComments ||= []).push(comment);
						}

						next();

						if (comments[0]) {
							const slice = source.slice(node.end, comments[0].start);

							if (/^[,) \t]*$/.test(slice)) {
								node.trailingComments = [/** @type {CommentWithLocation} */ (comments.shift())];
							}
						}
					}
				}
			);
		}
	};
}

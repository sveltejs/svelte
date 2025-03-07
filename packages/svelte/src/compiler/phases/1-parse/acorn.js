/** @import { Comment, Program } from 'estree' */
import * as acorn from 'acorn';
import { walk } from 'zimmerframe';
import { tsPlugin } from '@sveltejs/acorn-typescript';

const ParserWithTS = acorn.Parser.extend(tsPlugin());

/**
 * @param {string} source
 * @param {boolean} typescript
 * @param {boolean} [is_script]
 */
export function parse(source, typescript, is_script) {
	const parser = typescript ? ParserWithTS : acorn.Parser;
	const { onComment, add_comments } = get_comment_handlers(source);
	// @ts-ignore
	const parse_statement = parser.prototype.parseStatement;

	// If we're dealing with a <script> then it might contain an export
	// for something that doesn't exist directly inside but is inside the
	// component instead, so we need to ensure that Acorn doesn't throw
	// an error in these cases
	if (is_script) {
		// @ts-ignore
		parser.prototype.parseStatement = function (...args) {
			const v = parse_statement.call(this, ...args);
			// @ts-ignore
			this.undefinedExports = {};
			return v;
		};
	}

	let ast;

	try {
		ast = parser.parse(source, {
			onComment,
			sourceType: 'module',
			ecmaVersion: 13,
			locations: true
		});
	} finally {
		if (is_script) {
			// @ts-ignore
			parser.prototype.parseStatement = parse_statement;
		}
	}

	add_comments(ast);

	return /** @type {Program} */ (ast);
}

/**
 * @param {string} source
 * @param {boolean} typescript
 * @param {number} index
 * @returns {acorn.Expression & { leadingComments?: CommentWithLocation[]; trailingComments?: CommentWithLocation[]; }}
 */
export function parse_expression_at(source, typescript, index) {
	const parser = typescript ? ParserWithTS : acorn.Parser;
	const { onComment, add_comments } = get_comment_handlers(source);

	const ast = parser.parseExpressionAt(source, index, {
		onComment,
		sourceType: 'module',
		ecmaVersion: 13,
		locations: true
	});

	add_comments(ast);

	return ast;
}

/**
 * Acorn doesn't add comments to the AST by itself. This factory returns the capabilities
 * to add them after the fact. They are needed in order to support `svelte-ignore` comments
 * in JS code and so that `prettier-plugin-svelte` doesn't remove all comments when formatting.
 * @param {string} source
 */
function get_comment_handlers(source) {
	/**
	 * @typedef {Comment & {
	 *   start: number;
	 *   end: number;
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

			walk(ast, null, {
				_(node, { next, path }) {
					let comment;

					while (comments[0] && comments[0].start < node.start) {
						comment = /** @type {CommentWithLocation} */ (comments.shift());
						(node.leadingComments ||= []).push(comment);
					}

					next();

					if (comments[0]) {
						const parent = /** @type {any} */ (path.at(-1));

						if (parent === undefined || node.end !== parent.end) {
							const slice = source.slice(node.end, comments[0].start);
							const is_last_in_body =
								((parent?.type === 'BlockStatement' || parent?.type === 'Program') &&
									parent.body.indexOf(node) === parent.body.length - 1) ||
								(parent?.type === 'ArrayExpression' &&
									parent.elements.indexOf(node) === parent.elements.length - 1) ||
								(parent?.type === 'ObjectExpression' &&
									parent.properties.indexOf(node) === parent.properties.length - 1);

							if (is_last_in_body) {
								// Special case: There can be multiple trailing comments after the last node in a block,
								// and they can be separated by newlines
								let end = node.end;

								while (comments.length) {
									const comment = comments[0];
									if (parent && comment.start >= parent.end) break;

									(node.trailingComments ||= []).push(comment);
									comments.shift();
									end = comment.end;
								}
							} else if (node.end <= comments[0].start && /^[,) \t]*$/.test(slice)) {
								node.trailingComments = [/** @type {CommentWithLocation} */ (comments.shift())];
							}
						}
					}
				}
			});

			// Special case: Trailing comments after the root node (which can only happen for expression tags or for Program nodes).
			// Adding them ensures that we can later detect the end of the expression tag correctly.
			if (comments.length > 0 && (comments[0].start >= ast.end || ast.type === 'Program')) {
				(ast.trailingComments ||= []).push(...comments.splice(0));
			}
		}
	};
}

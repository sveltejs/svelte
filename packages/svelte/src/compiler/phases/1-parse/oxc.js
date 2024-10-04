/** @import { ArrayExpression, BlockStatement, Node, ObjectExpression, Program, Comment } from 'oxc-svelte/ast' */
import { walk } from 'zimmerframe';
import * as oxc from 'oxc-svelte';

/**
 * @param {string} source
 * @param {boolean} typescript
 */
export function parse(source, typescript) {
	const res = oxc.parse(source, typescript);
	add_comments(source, res.ast, res.comments);

	return res.ast;
}

/**
 * @param {string} source
 * @param {boolean} typescript
 * @param {number} index
 */
export function parse_expression_at(source, typescript, index) {
	const res = oxc.parse_expression_at(source, index, typescript);
	add_comments(source, res.ast, res.comments);

	return res.ast;
}

/**
 * @param {string} source
 * @param {boolean} typescript
 * @param {number} index
 * @param {boolean} allow_type_annotation
 */
export function parse_pattern_at(source, typescript, index, allow_type_annotation) {
	const res = oxc.parse_pattern_at(source, index, typescript, allow_type_annotation);
	add_comments(source, res.ast, res.comments);

	return res.ast;
}


/**
 * Oxc returns comments separately from the AST. This factory returns the capabilities
 * to add them after the fact. They are needed in order to support `svelte-ignore` comments
 * in JS code and so that `prettier-plugin-svelte` doesn't remove all comments when formatting.
 * @template {Node} T
 * @param {string} source
 * @param {T} ast
 * @param {Comment[]} comments
 * @returns {T}
 */
function add_comments(source, ast, comments) {
	if (comments.length === 0) return ast;

	walk(/** @type {Node} */ (ast), null, {
		_(node, { next, path }) {
			let comment;

			while (comments[0] && comments[0].start < node.start) {
				comment = /** @type {Comment} */ (comments.shift());
				(node.leading_comments ||= []).push(comment);
			}

			next();

			if (!comments[0]) {
				return;
			}
			const parent =
				/** @type {BlockStatement | Program | ArrayExpression | ObjectExpression} */ (
					path.at(-1)
				);

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

						(node.trailing_comments ||= []).push(comment);
						comments.shift();
						end = comment.end;
					}
				} else if (node.end <= comments[0].start && /^[,) \t]*$/.test(slice)) {
					node.trailing_comments = [/** @type {Comment} */ (comments.shift())];
				}
			}
		}
	});

	// Special case: Trailing comments after the root node (which can only happen for expression tags or for Program nodes).
	// Adding them ensures that we can later detect the end of the expression tag correctly.
	if (comments.length > 0 && (comments[0].start >= ast.end || ast.type === 'Program')) {
		(ast.trailing_comments ||= []).push(...comments.splice(0));
	}

	return ast;
}

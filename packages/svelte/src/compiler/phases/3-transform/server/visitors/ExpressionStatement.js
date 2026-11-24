/** @import { ExpressionStatement } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '#compiler/builders';
import { get_rune } from '../../../scope.js';

/**
 * @param {ExpressionStatement} node
 * @param {Context} context
 */
export function ExpressionStatement(node, context) {
	const rune = get_rune(node.expression, context.state.scope);

	if (
		rune === '$effect' ||
		rune === '$effect.pre' ||
		rune === '$effect.root' ||
		rune === '$inspect.trace'
	) {
		// These statements are removed from server output. Remove their comments as well,
		// otherwise annotations inside them can attach to the next statement.
		if (node.start !== undefined && node.end !== undefined) {
			const { start, end } = node;
			context.state.analysis.comments = context.state.analysis.comments.filter(
				(comment) => comment.start < start || comment.end > end
			);
		}
		return b.empty;
	}

	context.next();
}

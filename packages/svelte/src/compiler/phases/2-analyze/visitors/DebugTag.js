/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { validate_opening_tag } from './shared/utils.js';

/**
 * @param {AST.DebugTag} node
 * @param {Context} context
 */
export function DebugTag(node, context) {
	if (context.state.analysis.runes) {
		validate_opening_tag(node, context.state, '@');
	}

	context.next();
}

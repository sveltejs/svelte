/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { mark_subtree_dynamic } from './shared/fragment.js';
import { validate_opening_tag } from './shared/utils.js';

/**
 * @param {AST.HtmlTag} node
 * @param {Context} context
 */
export function HtmlTag(node, context) {
	if (context.state.analysis.runes) {
		validate_opening_tag(node, context.state, '@');
	}

	// unfortunately this is necessary in order to fix invalid HTML
	mark_subtree_dynamic(context.path);

	context.next({ ...context.state, expression: node.metadata.expression });
}

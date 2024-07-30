/** @import { HtmlTag } from '#compiler' */
/** @import { Context } from '../types' */
import { validate_opening_tag } from './shared/utils.js';

/**
 * @param {HtmlTag} node
 * @param {Context} context
 */
export function HtmlTag(node, context) {
	if (context.state.analysis.runes) {
		validate_opening_tag(node, context.state, '@');
	}

	context.next();
}

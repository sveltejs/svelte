/** @import { ConditionalExpression } from 'estree' */
/** @import { Context } from '../types' */

import { mark_subtree_dynamic } from './shared/fragment';

/**
 * @param {ConditionalExpression} node
 * @param {Context} context
 */
export function ConditionalExpression(node, context) {
	// In legacy mode, we treat conditionals inside the template as not inlinable so patterns
	// such as BROWSER ? foo : bar, continue to work during hydration
	if (context.state.expression && !context.state.analysis.runes) {
		context.state.expression.can_inline = false;
		mark_subtree_dynamic(context.path);
	}
}

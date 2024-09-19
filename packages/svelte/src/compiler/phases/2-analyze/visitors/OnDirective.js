/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as w from '../../../warnings.js';
import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {AST.OnDirective} node
 * @param {Context} context
 */
export function OnDirective(node, context) {
	if (context.state.analysis.runes) {
		const parent_type = context.path.at(-1)?.type;

		// Don't warn on component events; these might not be under the author's control so the warning would be unactionable
		if (parent_type === 'RegularElement' || parent_type === 'SvelteElement') {
			w.event_directive_deprecated(node, node.name);
		}
	}

	const parent = context.path.at(-1);
	if (parent?.type === 'SvelteElement' || parent?.type === 'RegularElement') {
		context.state.analysis.event_directive_node ??= node;
	}

	mark_subtree_dynamic(context.path);

	context.next({ ...context.state, expression: node.metadata.expression });
}

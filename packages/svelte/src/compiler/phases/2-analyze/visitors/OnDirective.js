/** @import { OnDirective } from '#compiler' */
/** @import { Context } from '../types' */
import * as w from '../../../warnings.js';

/**
 * @param {OnDirective} node
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

	context.next();
}

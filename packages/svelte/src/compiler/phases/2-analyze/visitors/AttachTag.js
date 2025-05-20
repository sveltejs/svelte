/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */

import { mark_subtree_dynamic } from './shared/fragment.js';
import * as w from '../../../warnings.js';

/**
 * @param {AST.AttachTag} node
 * @param {Context} context
 */
export function AttachTag(node, context) {
	mark_subtree_dynamic(context.path);

	context.next({ ...context.state, expression: node.metadata.expression });

	if (!context.state.analysis.runes) {
		for (const dep of node.metadata.expression.dependencies) {
			if (dep.mutated) {
				w.attachment_legacy_member_access(node.expression);
				break;
			}
		}
	}
}

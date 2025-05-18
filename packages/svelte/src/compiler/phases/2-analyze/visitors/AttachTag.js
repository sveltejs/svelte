/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */

import { walk } from 'zimmerframe';
import { mark_subtree_dynamic } from './shared/fragment.js';
import * as w from '../../../warnings.js';

/**
 * @param {AST.AttachTag} node
 * @param {Context} context
 */
export function AttachTag(node, context) {
	mark_subtree_dynamic(context.path);
	if (!context.state.analysis.runes) {
		walk(
			node.expression,
			{},
			{
				MemberExpression(node) {
					w.attachment_legacy_member_access(node);
				}
			}
		);
	}
	context.next({ ...context.state, expression: node.metadata.expression });
}

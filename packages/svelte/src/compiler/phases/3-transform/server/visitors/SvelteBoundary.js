/** @import { BlockStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import {
	BLOCK_CLOSE,
	BLOCK_OPEN,
	BLOCK_OPEN_ELSE
} from '../../../../../internal/server/hydration.js';
import * as b from '#compiler/builders';
import { build_attribute_value } from './shared/utils.js';

/**
 * @param {AST.SvelteBoundary} node
 * @param {ComponentContext} context
 */
export function SvelteBoundary(node, context) {
	const pending_snippet = node.metadata.pending;

	if (pending_snippet) {
		context.state.template.push(b.literal(BLOCK_OPEN_ELSE));

		if (pending_snippet.type === 'Attribute') {
			const value = build_attribute_value(pending_snippet.value, context, false, true);
			context.state.template.push(b.call(value, b.id('$$payload')));
		} else if (pending_snippet.type === 'SnippetBlock') {
			context.state.template.push(
				/** @type {BlockStatement} */ (context.visit(pending_snippet.body))
			);
		}
	} else {
		// No pending snippet - render main content (may be async or sync)
		context.state.template.push(b.literal(BLOCK_OPEN)); // <!--[-->
		context.state.template.push(/** @type {BlockStatement} */ (context.visit(node.fragment)));
	}

	context.state.template.push(b.literal(BLOCK_CLOSE));
}

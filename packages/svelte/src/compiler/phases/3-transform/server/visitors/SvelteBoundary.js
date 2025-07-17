/** @import { BlockStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { BLOCK_CLOSE, BLOCK_OPEN } from '../../../../../internal/server/hydration.js';
import * as b from '#compiler/builders';
import { build_attribute_value } from './shared/utils.js';

/**
 * @param {AST.SvelteBoundary} node
 * @param {ComponentContext} context
 */
export function SvelteBoundary(node, context) {
	context.state.template.push(b.literal(BLOCK_OPEN));

	// if this has a `pending` snippet, render it
	const pending_attribute = /** @type {AST.Attribute} */ (
		node.attributes.find((node) => node.type === 'Attribute' && node.name === 'pending')
	);

	const pending_snippet = /** @type {AST.SnippetBlock} */ (
		node.fragment.nodes.find(
			(node) => node.type === 'SnippetBlock' && node.expression.name === 'pending'
		)
	);

	if (pending_attribute) {
		const value = build_attribute_value(pending_attribute.value, context, false, true);
		context.state.template.push(b.call(value, b.id('$$payload')));
	} else if (pending_snippet) {
		context.state.template.push(
			/** @type {BlockStatement} */ (context.visit(pending_snippet.body))
		);
	} else {
		context.state.template.push(/** @type {BlockStatement} */ (context.visit(node.fragment)));
	}

	context.state.template.push(b.literal(BLOCK_CLOSE));
}

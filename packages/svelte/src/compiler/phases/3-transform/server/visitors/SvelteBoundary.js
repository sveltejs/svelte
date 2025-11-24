/** @import { BlockStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import {
	block_close,
	block_open,
	block_open_else,
	build_attribute_value,
	build_template
} from './shared/utils.js';

/**
 * @param {AST.SvelteBoundary} node
 * @param {ComponentContext} context
 */
export function SvelteBoundary(node, context) {
	// if this has a `pending` snippet, render it
	const pending_attribute = /** @type {AST.Attribute} */ (
		node.attributes.find((node) => node.type === 'Attribute' && node.name === 'pending')
	);
	const is_pending_attr_nullish =
		pending_attribute &&
		typeof pending_attribute.value === 'object' &&
		!Array.isArray(pending_attribute.value) &&
		!context.state.scope.evaluate(pending_attribute.value.expression).is_defined;

	const pending_snippet = /** @type {AST.SnippetBlock} */ (
		node.fragment.nodes.find(
			(node) => node.type === 'SnippetBlock' && node.expression.name === 'pending'
		)
	);

	if (pending_attribute || pending_snippet) {
		if (pending_attribute && is_pending_attr_nullish && !pending_snippet) {
			const callee = build_attribute_value(
				pending_attribute.value,
				context,
				(expression) => expression,
				false,
				true
			);
			const pending = b.call(callee, b.id('$$renderer'));
			const block = /** @type {BlockStatement} */ (context.visit(node.fragment));
			context.state.template.push(
				b.if(
					callee,
					b.block(build_template([block_open_else, b.stmt(pending), block_close])),
					b.block(build_template([block_open, block, block_close]))
				)
			);
		} else {
			const pending = pending_attribute
				? b.call(
						build_attribute_value(
							pending_attribute.value,
							context,
							(expression) => expression,
							false,
							true
						),
						b.id('$$renderer')
					)
				: /** @type {BlockStatement} */ (context.visit(pending_snippet.body));
			context.state.template.push(block_open_else, pending, block_close);
		}
	} else {
		const block = /** @type {BlockStatement} */ (context.visit(node.fragment));
		context.state.template.push(block_open, block, block_close);
	}
}

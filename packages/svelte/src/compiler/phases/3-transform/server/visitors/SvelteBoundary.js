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
	// Extract the `failed` snippet/attribute
	const failed_snippet = /** @type {AST.SnippetBlock | undefined} */ (
		node.fragment.nodes.find(
			(node) => node.type === 'SnippetBlock' && node.expression.name === 'failed'
		)
	);
	const failed_attribute = /** @type {AST.Attribute} */ (
		node.attributes.find((node) => node.type === 'Attribute' && node.name === 'failed')
	);

	// Extract the `pending` snippet/attribute
	const pending_attribute = /** @type {AST.Attribute} */ (
		node.attributes.find((node) => node.type === 'Attribute' && node.name === 'pending')
	);
	const is_pending_attr_nullish =
		pending_attribute &&
		typeof pending_attribute.value === 'object' &&
		!Array.isArray(pending_attribute.value) &&
		!context.state.scope.evaluate(pending_attribute.value.expression).is_defined;
	const pending_snippet = /** @type {AST.SnippetBlock | undefined} */ (
		node.fragment.nodes.find(
			(node) => node.type === 'SnippetBlock' && node.expression.name === 'pending'
		)
	);

	const children_nodes = node.fragment.nodes.filter(
		(child) =>
			!(child.type === 'SnippetBlock' && ['failed', 'pending'].includes(child.expression.name))
	);

	const children_fragment = { ...node.fragment, nodes: children_nodes };
	const children_block = /** @type {BlockStatement} */ (
		context.visit(children_fragment, {
			...context.state,
			scope: context.state.scopes.get(node.fragment) ?? context.state.scope
		})
	);

	/** @type {BlockStatement} */
	let children_body;

	if (pending_attribute || pending_snippet) {
		if (pending_attribute && is_pending_attr_nullish && !pending_snippet) {
			const { callee, pending_block } = build_pending_attribute_block(pending_attribute, context);

			children_body = b.block([
				b.if(
					callee,
					pending_block,
					b.block(build_template([block_open, children_block, block_close]))
				)
			]);
		} else {
			children_body = pending_attribute
				? build_pending_attribute_block(pending_attribute, context).pending_block
				: build_pending_snippet_block(/** @type {AST.SnippetBlock} */ (pending_snippet), context);
		}
	} else {
		children_body = b.block(build_template([block_open, children_block, block_close]));
	}

	// When there's no `failed` snippet/attribute, skip the boundary wrapper entirely
	// (saves bytes / more performant at runtime)
	if (!failed_snippet && !failed_attribute) {
		context.state.template.push(...children_body.body);
		return;
	}

	const props = b.object([]);
	if (failed_attribute && !failed_snippet) {
		const failed_callee = build_attribute_value(
			failed_attribute.value,
			context,
			(expression) => expression,
			false,
			true
		);

		props.properties.push(b.init('failed', failed_callee));
	} else if (failed_snippet) {
		context.visit(failed_snippet, context.state);
		props.properties.push(b.init('failed', failed_snippet.expression));
	}

	context.state.template.push(
		b.stmt(b.call('$$renderer.boundary', props, b.arrow([b.id('$$renderer')], children_body)))
	);
}

/**
 * @param {AST.Attribute} attribute
 * @param {ComponentContext} context
 */
function build_pending_attribute_block(attribute, context) {
	const callee = build_attribute_value(
		attribute.value,
		context,
		(expression) => expression,
		false,
		true
	);
	const pending = b.call(callee, b.id('$$renderer'));

	return {
		callee,
		pending_block: b.block(build_template([block_open_else, b.stmt(pending), block_close]))
	};
}

/**
 * @param {AST.SnippetBlock} snippet
 * @param {ComponentContext} context
 */
function build_pending_snippet_block(snippet, context) {
	return b.block(
		build_template([
			block_open_else,
			/** @type {BlockStatement} */ (context.visit(snippet.body)),
			block_close
		])
	);
}

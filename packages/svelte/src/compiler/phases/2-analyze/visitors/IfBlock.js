/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as b from '#compiler/builders';
import { regex_not_whitespace } from '../../patterns.js';
import { mark_subtree_dynamic } from './shared/fragment.js';
import { validate_block_not_empty, validate_opening_tag } from './shared/utils.js';

/**
 * @param {AST.IfBlock} node
 * @param {Context} context
 */
export function IfBlock(node, context) {
	validate_block_not_empty(node.consequent, context);
	validate_block_not_empty(node.alternate, context);

	if (context.state.analysis.runes) {
		validate_opening_tag(node, context.state, node.elseif ? ':' : '#');
	}

	mark_subtree_dynamic(context.path);

	context.visit(node.test, {
		...context.state,
		expression: node.metadata.expression
	});

	context.visit(node.consequent);
	if (node.alternate) context.visit(node.alternate);

	// Check if we can flatten branches
	const alt = node.alternate;

	if (alt && alt.nodes.length === 1 && alt.nodes[0].type === 'IfBlock' && alt.nodes[0].elseif) {
		const elseif = alt.nodes[0];

		// Don't flatten if this else-if has an await expression or new blockers
		// TODO would be nice to check the await expression itself to see if it's awaiting the same thing as a previous if expression
		if (
			!elseif.metadata.expression.has_await &&
			!elseif.metadata.expression.has_more_blockers_than(node.metadata.expression)
		) {
			// Roll the existing flattened branches (if any) into this one, then delete those of the else-if block
			// to avoid processing them multiple times as we walk down the chain during code transformation.
			node.metadata.flattened = [elseif, ...(elseif.metadata.flattened ?? [])];
			elseif.metadata.flattened = undefined;
		}
	}

	if (context.state.options.preserveWhitespace) {
		return;
	}

	let nested_if = get_mergeable_nested_if_block(node);

	while (nested_if) {
		node.test = b.logical('&&', node.test, nested_if.test);
		node.consequent = nested_if.consequent;
		node.metadata.expression.merge(nested_if.metadata.expression);

		nested_if = get_mergeable_nested_if_block(node);
	}
}

/**
 * @param {AST.IfBlock} node
 * @returns {AST.IfBlock | undefined}
 */
function get_mergeable_nested_if_block(node) {
	if (node.alternate || !can_merge_expression(node)) {
		return;
	}

	const nested = node.consequent.nodes.filter(is_content_node);

	if (
		nested.length !== 1 ||
		nested[0].type !== 'IfBlock' ||
		nested[0].elseif ||
		nested[0].alternate ||
		!can_merge_expression(nested[0])
	) {
		return;
	}

	return nested[0];
}

/**
 * @param {AST.IfBlock} node
 */
function can_merge_expression(node) {
	const { expression } = node.metadata;

	return (
		!expression.has_await &&
		!expression.has_call &&
		!expression.has_assignment &&
		!expression.has_blockers()
	);
}

/**
 * @param {AST.SvelteNode} node
 */
function is_content_node(node) {
	return node.type !== 'Text' || regex_not_whitespace.test(node.data);
}

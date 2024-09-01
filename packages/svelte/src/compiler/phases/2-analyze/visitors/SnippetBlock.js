/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { validate_block_not_empty, validate_opening_tag } from './shared/utils.js';
import * as e from '../../../errors.js';

/**
 * @param {AST.SnippetBlock} node
 * @param {Context} context
 */
export function SnippetBlock(node, context) {
	validate_block_not_empty(node.body, context);

	if (context.state.analysis.runes) {
		validate_opening_tag(node, context.state, '#');
	}

	for (const arg of node.parameters) {
		if (arg.type === 'RestElement') {
			e.snippet_invalid_rest_parameter(arg);
		}
	}

	context.next({ ...context.state, parent_element: null });

	const { path } = context;
	const parent = path.at(-2);
	if (!parent) return;

	if (
		parent.type === 'Component' &&
		parent.attributes.some(
			(attribute) =>
				(attribute.type === 'Attribute' || attribute.type === 'BindDirective') &&
				attribute.name === node.expression.name
		)
	) {
		e.snippet_shadowing_prop(node, node.expression.name);
	}

	if (node.expression.name !== 'children') return;

	if (
		parent.type === 'Component' ||
		parent.type === 'SvelteComponent' ||
		parent.type === 'SvelteSelf'
	) {
		if (
			parent.fragment.nodes.some(
				(node) => node.type !== 'SnippetBlock' && (node.type !== 'Text' || node.data.trim())
			)
		) {
			e.snippet_conflict(node);
		}
	}
}

/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { unwrap_optional } from '../../../utils/ast.js';
import * as e from '../../../errors.js';
import { validate_opening_tag } from './shared/utils.js';
import { mark_subtree_dynamic } from './shared/fragment.js';
import { is_resolved_snippet } from './shared/snippets.js';

/**
 * @param {AST.RenderTag} node
 * @param {Context} context
 */
export function RenderTag(node, context) {
	validate_opening_tag(node, context.state, '@');

	node.metadata.path = [...context.path];

	const callee = unwrap_optional(node.expression).callee;

	const binding = callee.type === 'Identifier' ? context.state.scope.get(callee.name) : null;

	node.metadata.dynamic = binding?.kind !== 'normal';

	/**
	 * If we can't unambiguously resolve this to a declaration, we
	 * must assume the worst and link the render tag to every snippet
	 */
	let resolved = callee.type === 'Identifier' && is_resolved_snippet(binding);

	if (binding?.initial?.type === 'SnippetBlock') {
		// if this render tag unambiguously references a local snippet, our job is easy
		node.metadata.snippets.add(binding.initial);
	}

	context.state.analysis.snippet_renderers.set(node, resolved);
	context.state.analysis.uses_render_tags = true;

	const raw_args = unwrap_optional(node.expression).arguments;
	for (const arg of raw_args) {
		if (arg.type === 'SpreadElement') {
			e.render_tag_invalid_spread_argument(arg);
		}
	}

	if (
		callee.type === 'MemberExpression' &&
		callee.property.type === 'Identifier' &&
		['bind', 'apply', 'call'].includes(callee.property.name)
	) {
		e.render_tag_invalid_call_expression(node);
	}

	mark_subtree_dynamic(context.path);

	context.next({ ...context.state, render_tag: node });
}

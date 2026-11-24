/** @import { AST, Binding } from '#compiler' */
/** @import { Scope } from '../../scope' */
/** @import { Context } from '../types' */
import { walk } from 'zimmerframe';
import { validate_block_not_empty, validate_opening_tag } from './shared/utils.js';
import * as e from '../../../errors.js';

/**
 * @param {AST.SnippetBlock} node
 * @param {Context} context
 */
export function SnippetBlock(node, context) {
	context.state.analysis.snippets.add(node);

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

	const is_top_level = context.path.length === 1 && context.path[0].type === 'Fragment';

	if (is_top_level) {
		const name = node.expression.name;

		if (context.state.analysis.instance.scope.declarations.has(name)) {
			e.declaration_duplicate(node.expression, name);
		}

		node.metadata.can_hoist = can_hoist_snippet(node, context.state.scope, context.state.scopes);

		if (node.metadata.can_hoist) {
			const name = node.expression.name;
			const binding = /** @type {Binding} */ (context.state.scope.get(name));
			context.state.analysis.module.scope.declarations.set(name, binding);
		}
	}

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
				(node) =>
					node.type !== 'SnippetBlock' &&
					(node.type !== 'Text' || node.data.trim()) &&
					node.type !== 'Comment'
			)
		) {
			e.snippet_conflict(node);
		}
	}
}

/**
 * @param {AST.SnippetBlock} node
 * @param {Scope} scope
 * @param {Map<AST.SvelteNode, Scope>} scopes
 */
function can_hoist_snippet(node, scope, scopes, visited = new Set()) {
	for (const [reference] of scope.references) {
		const binding = scope.get(reference);
		if (!binding) continue;

		if (binding.blocker) {
			return false;
		}

		if (binding.scope.function_depth === 0) {
			continue;
		}

		// ignore bindings declared inside the snippet (e.g. the snippet's own parameters)
		if (binding.scope.function_depth >= scope.function_depth) {
			continue;
		}

		if (binding.initial?.type === 'SnippetBlock') {
			if (visited.has(binding)) continue;
			visited.add(binding);
			const snippet_scope = /** @type {Scope} */ (scopes.get(binding.initial));

			if (can_hoist_snippet(binding.initial, snippet_scope, scopes, visited)) {
				continue;
			}
		}

		return false;
	}

	// Slots implicitly reference the component's $$props, even without explicit bindings.
	let can_hoist = true;

	walk(/** @type {AST.SvelteNode} */ (node.body), null, {
		SlotElement(_, { stop }) {
			can_hoist = false;
			stop();
		}
	});

	return can_hoist;
}

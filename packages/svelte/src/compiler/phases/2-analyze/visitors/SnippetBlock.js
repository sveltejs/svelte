/** @import { AST, Binding, SvelteNode } from '#compiler' */
/** @import { Scope } from '../../scope' */
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

	const local_scope = context.state.scope;
	const can_hoist =
		context.path.length === 1 &&
		context.path[0].type === 'Fragment' &&
		can_hoist_snippet(node, local_scope, context.state.scopes);
	const undefined_exports = context.state.analysis.undefined_exports;
	const name = node.expression.name;

	if (can_hoist) {
		const binding = /** @type {Binding} */ (context.state.scope.get(name));
		context.state.analysis.module.scope.declarations.set(name, binding);
	}

	if (!can_hoist && undefined_exports.has(name)) {
		e.snippet_invalid_export(/** @type {any} */ (undefined_exports.get(name)));
	}

	node.metadata.can_hoist = can_hoist;

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
 * @param {Map<SvelteNode, Scope>} scopes
 * @param {Scope} scope
 */
function can_hoist_snippet(node, scope, scopes, visited = new Set()) {
	let can_hoist = true;

	ref_loop: for (const [reference] of scope.references) {
		const local_binding = scope.get(reference);

		if (local_binding) {
			if (local_binding.node === node.expression || local_binding.scope.function_depth === 0) {
				continue;
			}
			/** @type {Scope | null} */
			let current_scope = local_binding.scope;

			while (current_scope !== null) {
				if (current_scope === scope) {
					continue ref_loop;
				}
				current_scope = current_scope.parent;
			}

			// Recursively check if another snippet can be hoisted
			if (local_binding.kind === 'normal') {
				for (const ref of local_binding.references) {
					const parent = ref.path.at(-1);
					if (ref.node === local_binding.node && parent?.type === 'SnippetBlock') {
						const ref_scope = scopes.get(parent);
						if (visited.has(ref)) {
							break;
						}
						visited.add(ref);
						if (ref_scope && can_hoist_snippet(parent, ref_scope, scopes, visited)) {
							continue ref_loop;
						}
						break;
					}
				}
			}
			can_hoist = false;
			break;
		}
	}

	return can_hoist;
}

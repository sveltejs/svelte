/** @import { AST, Binding } from '#compiler' */
/** @import { Context } from '../types' */
/** @import { Scope } from '../../scope' */
import * as e from '../../../errors.js';
import { extract_identifiers } from '../../../utils/ast.js';
import { mark_subtree_dynamic } from './shared/fragment.js';
import { validate_block_not_empty, validate_opening_tag } from './shared/utils.js';

/**
 * @param {AST.EachBlock} node
 * @param {Context} context
 */
export function EachBlock(node, context) {
	validate_opening_tag(node, context.state, '#');

	validate_block_not_empty(node.body, context);
	validate_block_not_empty(node.fallback, context);

	const id = node.context;
	if (id?.type === 'Identifier' && (id.name === '$state' || id.name === '$derived')) {
		// TODO weird that this is necessary
		e.state_invalid_placement(node, id.name);
	}

	if (node.key) {
		// treat `{#each items as item, i (i)}` as a normal indexed block, everything else as keyed
		node.metadata.keyed =
			node.key.type !== 'Identifier' || !node.index || node.key.name !== node.index;
	}

	// evaluate expression in parent scope
	context.visit(node.expression, {
		...context.state,
		expression: node.metadata.expression,
		scope: /** @type {Scope} */ (context.state.scope.parent)
	});

	context.visit(node.body);
	if (node.key) context.visit(node.key);
	if (node.fallback) context.visit(node.fallback);

	if (!context.state.analysis.runes) {
		let mutated =
			!!node.context &&
			extract_identifiers(node.context).some((id) => {
				const binding = context.state.scope.get(id.name);
				return !!binding?.mutated;
			});

		// collect transitive dependencies...
		for (const binding of node.metadata.expression.dependencies) {
			collect_transitive_dependencies(binding, node.metadata.transitive_deps);
		}

		// ...and ensure they are marked as state, so they can be turned
		// into mutable sources and invalidated
		if (mutated) {
			for (const binding of node.metadata.transitive_deps) {
				if (
					binding.kind === 'normal' &&
					(binding.declaration_kind === 'const' ||
						binding.declaration_kind === 'let' ||
						binding.declaration_kind === 'var')
				) {
					binding.kind = 'state';
				}
			}
		}
	}

	mark_subtree_dynamic(context.path);
}

/**
 * @param {Binding} binding
 * @param {Set<Binding>} bindings
 * @returns {void}
 */
function collect_transitive_dependencies(binding, bindings) {
	if (bindings.has(binding)) {
		return;
	}
	bindings.add(binding);

	if (binding.kind === 'legacy_reactive') {
		for (const dep of binding.legacy_dependencies) {
			collect_transitive_dependencies(dep, bindings);
		}
	}
}

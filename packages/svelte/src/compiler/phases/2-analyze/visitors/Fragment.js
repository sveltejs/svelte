/** @import { Expression } from 'estree' */
/** @import { AST, Binding } from '#compiler' */
/** @import { Context, AnalysisState } from '../types.js' */
import { walk } from 'zimmerframe';
import * as e from '../../../errors.js';
import { extract_identifiers } from '../../../utils/ast.js';
import check_graph_for_cycles from '../utils/check_graph_for_cycles.js';
import is_reference from 'is-reference';
import { set_scope } from '../../scope.js';

/**
 * @param {AST.Fragment} node
 * @param {Context} context
 */
export function Fragment(node, context) {
	context.next({ ...context.state, fragment: node });

	if (!context.state.analysis.runes) {
		node.metadata.consts.sync = sort_const_tags(node.metadata.consts.sync, context.state);
	}
}

/**
 * Match Svelte 4 behaviour by sorting ConstTag nodes in topological order
 * @param {AST.ConstTag[]} nodes
 * @param {AnalysisState} state
 */
function sort_const_tags(nodes, state) {
	/**
	 * @typedef {{
	 *   node: AST.ConstTag;
	 *   deps: Set<Binding>;
	 * }} Tag
	 */

	/** @type {Map<Binding, Tag>} */
	const tags = new Map();

	for (const node of nodes) {
		const declaration = node.declaration.declarations[0];

		const bindings = extract_identifiers(declaration.id).map((id) => {
			return /** @type {Binding} */ (state.scope.get(id.name));
		});

		/** @type {Set<Binding>} */
		const deps = new Set();

		walk(declaration.init, state, {
			// @ts-expect-error don't know, don't care
			_: set_scope,
			Identifier(node, context) {
				const parent = /** @type {Expression} */ (context.path.at(-1));

				if (is_reference(node, parent)) {
					const binding = context.state.scope.get(node.name);
					if (binding) deps.add(binding);
				}
			}
		});

		for (const binding of bindings) {
			tags.set(binding, { node, deps });
		}
	}

	if (tags.size === 0) {
		return nodes;
	}

	/** @type {Array<[Binding, Binding]>} */
	const edges = [];

	for (const [id, tag] of tags) {
		for (const dep of tag.deps) {
			if (tags.has(dep)) {
				edges.push([id, dep]);
			}
		}
	}

	const cycle = check_graph_for_cycles(edges);
	if (cycle?.length) {
		const tag = /** @type {Tag} */ (tags.get(cycle[0]));
		e.const_tag_cycle(tag.node, cycle.map((binding) => binding.node.name).join(' → '));
	}

	/** @type {AST.ConstTag[]} */
	const sorted = [];

	/** @param {Tag} tag */
	function add(tag) {
		if (sorted.includes(tag.node)) {
			return;
		}

		for (const dep of tag.deps) {
			const dep_tag = tags.get(dep);
			if (dep_tag) add(dep_tag);
		}

		sorted.push(tag.node);
	}

	for (const tag of tags.values()) {
		add(tag);
	}

	return sorted;
}

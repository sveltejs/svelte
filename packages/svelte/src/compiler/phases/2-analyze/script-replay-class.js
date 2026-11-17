/** @import * as ESTree from 'estree' */
/** @import { Binding } from '#compiler' */
/** @import { ComponentAnalysis } from '../types.js' */
/** @import { Scope } from '../scope.js' */
import { walk } from 'zimmerframe';
import { is_state_creation_rune } from '../../../utils.js';
import { get_rune } from '../scope.js';

/**
 * Native class fields and constructor-local state are not registered by the
 * top-level VariableDeclaration facade.state hook. Keep known stateful classes
 * on the existing lowering until their external edits have logical-slot ownership.
 * Opaque imported constructors/helpers cannot be classified by this local check.
 *
 * @param {ESTree.Node[]} nodes
 * @param {ComponentAnalysis} analysis
 * @returns {ESTree.Node | null}
 */
export function find_stateful_class(nodes, analysis) {
	/** @param {ESTree.Node} node @param {Scope} scope */
	const scope_for = (node, scope) =>
		analysis.instance.scopes.get(node) ?? analysis.module.scopes.get(node) ?? scope;

	/**
	 * @param {ESTree.Expression | ESTree.Super} node
	 * @param {Scope} scope
	 * @param {Set<Binding>} [seen]
	 * @returns {{ node: ESTree.ClassDeclaration | ESTree.ClassExpression | ESTree.FunctionDeclaration | ESTree.FunctionExpression | ESTree.ArrowFunctionExpression, scope: Scope } | null}
	 */
	function definition(node, scope, seen = new Set()) {
		if (
			node.type === 'ClassExpression' ||
			node.type === 'FunctionExpression' ||
			node.type === 'ArrowFunctionExpression'
		) {
			return { node, scope };
		}
		if (node.type !== 'Identifier') return null;
		const binding = scope.get(node.name);
		if (!binding || seen.has(binding)) return null;
		seen.add(binding);
		const initial = binding.initial;
		if (
			initial?.type === 'ClassDeclaration' ||
			initial?.type === 'ClassExpression' ||
			initial?.type === 'FunctionDeclaration' ||
			initial?.type === 'FunctionExpression' ||
			initial?.type === 'ArrowFunctionExpression'
		) {
			return { node: initial, scope: binding.scope };
		}
		return initial?.type === 'Identifier' ? definition(initial, binding.scope, seen) : null;
	}

	/** @param {ESTree.Node} node @param {Scope} scope @param {Set<ESTree.Node>} [seen] @returns {boolean} */
	function creates_state(node, scope, seen = new Set()) {
		if (seen.has(node)) return false;
		seen.add(node);
		if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
			if (analysis.classes.get(node.body)?.size) return true;
			const parent = node.superClass && definition(node.superClass, scope);
			if (parent && creates_state(parent.node, parent.scope, seen)) return true;
		}
		let found = false;
		walk(
			node,
			{ scope },
			{
				_(node, context) {
					if (!found) context.next({ scope: scope_for(node, context.state.scope) });
				},
				CallExpression(node, { state, next }) {
					const rune = get_rune(node, state.scope);
					if (rune && is_state_creation_rune(rune)) {
						found = true;
						return;
					}
					const callee = definition(node.callee, state.scope);
					if (callee && creates_state(callee.node, callee.scope, seen)) found = true;
					else next();
				},
				NewExpression(node, { state, next }) {
					const callee = definition(node.callee, state.scope);
					if (callee && creates_state(callee.node, callee.scope, seen)) found = true;
					else next();
				}
			}
		);
		return found;
	}

	/** @type {ESTree.Node | null} */
	let unsupported = null;
	for (const node of nodes) {
		walk(
			node,
			{ scope: analysis.instance.scope },
			{
				_(node, context) {
					if (!unsupported) context.next({ scope: scope_for(node, context.state.scope) });
				},
				ClassDeclaration(node, { state, next }) {
					if (creates_state(node, state.scope)) unsupported = node;
					else next();
				},
				ClassExpression(node, { state, next }) {
					if (creates_state(node, state.scope)) unsupported = node;
					else next();
				},
				NewExpression(node, { state, next }) {
					const callee = definition(node.callee, state.scope);
					if (callee && creates_state(callee.node, callee.scope)) unsupported = node;
					else next();
				}
			}
		);
		if (unsupported) break;
	}
	return unsupported;
}

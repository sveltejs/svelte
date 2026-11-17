/** @import * as ESTree from 'estree' */
/** @import { Binding } from '#compiler' */
/** @import { ComponentAnalysis } from '../types.js' */
/** @import { Scope } from '../scope.js' */
import { walk } from 'zimmerframe';
import is_reference from 'is-reference';

/**
 * Component context maps are not yet attempt-local. Recognize known mutations
 * without treating ordinary effects/onMount or read-only parent lookups as writes.
 * This is not an inter-module effect analysis: opaque imported helpers remain a
 * separate unsupported runtime contract, not something this classifier can prove.
 *
 * @param {ESTree.Node[]} prefix
 * @param {ComponentAnalysis} analysis
 * @returns {ESTree.Node | null}
 */
export function find_context_mutation(prefix, analysis) {
	/** @type {Set<Binding>} */
	const setters = new Set();
	/** @type {ESTree.Node | null} */
	let mutation = null;

	/** @param {ESTree.MemberExpression} node */
	function key(node) {
		return node.computed
			? node.property.type === 'Literal'
				? node.property.value
				: null
			: node.property.type === 'Identifier'
				? node.property.name
				: null;
	}

	/** @param {ESTree.Expression} node @param {Scope} scope @param {Set<Binding>} [seen] @returns {boolean} */
	function namespace(node, scope, seen = new Set()) {
		if (node.type !== 'Identifier') return false;
		const binding = scope.get(node.name);
		if (!binding || seen.has(binding)) return false;
		seen.add(binding);
		const initial = binding.initial;
		if (initial?.type === 'ImportDeclaration') {
			return (
				initial.source.value === 'svelte' &&
				initial.specifiers.some(
					(specifier) =>
						specifier.type === 'ImportNamespaceSpecifier' && specifier.local.name === node.name
				)
			);
		}
		return initial?.type === 'Identifier' ? namespace(initial, binding.scope, seen) : false;
	}

	/** @param {ESTree.Expression} node @param {string} name @param {Scope} scope @param {Set<Binding>} [seen] @returns {boolean} */
	function imported(node, name, scope, seen = new Set()) {
		if (node.type === 'MemberExpression') {
			return key(node) === name && node.object.type !== 'Super' && namespace(node.object, scope);
		}
		if (node.type !== 'Identifier') return false;
		const binding = scope.get(node.name);
		if (!binding || seen.has(binding)) return false;
		seen.add(binding);
		const initial = binding.initial;
		if (initial?.type === 'ImportDeclaration') {
			return (
				initial.source.value === 'svelte' &&
				initial.specifiers.some(
					(specifier) =>
						specifier.type === 'ImportSpecifier' &&
						specifier.local.name === node.name &&
						(specifier.imported.type === 'Identifier'
							? specifier.imported.name
							: specifier.imported.value) === name
				)
			);
		}
		return initial?.type === 'Identifier' || initial?.type === 'MemberExpression'
			? imported(initial, name, binding.scope, seen)
			: false;
	}

	/** @param {ESTree.Expression} node @param {Scope} scope @param {Set<Binding>} [seen] @returns {boolean} */
	function setter(node, scope, seen = new Set()) {
		if (imported(node, 'setContext', scope)) return true;
		if (
			node.type === 'MemberExpression' &&
			key(node) === 1 &&
			node.object.type === 'CallExpression'
		) {
			return (
				node.object.callee.type !== 'Super' && imported(node.object.callee, 'createContext', scope)
			);
		}
		if (node.type !== 'Identifier') return false;
		const binding = scope.get(node.name);
		if (!binding || seen.has(binding)) return false;
		if (setters.has(binding)) return true;
		seen.add(binding);
		const initial = binding.initial;
		return initial?.type === 'Identifier' || initial?.type === 'MemberExpression'
			? setter(initial, binding.scope, seen)
			: false;
	}

	/** @param {ESTree.Expression} node @param {Scope} scope @param {Set<Binding>} [seen] @returns {boolean} */
	function context_map(node, scope, seen = new Set()) {
		if (node.type === 'CallExpression') {
			return node.callee.type !== 'Super' && imported(node.callee, 'getAllContexts', scope);
		}
		if (node.type !== 'Identifier') return false;
		const binding = scope.get(node.name);
		if (!binding || seen.has(binding)) return false;
		seen.add(binding);
		const initial = binding.initial;
		return initial?.type === 'Identifier' || initial?.type === 'CallExpression'
			? context_map(initial, binding.scope, seen)
			: false;
	}

	/** @param {ESTree.Node} node @param {Scope} scope */
	function scope_for(node, scope) {
		return analysis.instance.scopes.get(node) ?? analysis.module.scopes.get(node) ?? scope;
	}

	// createContext setters can be declared in the module as well as the instance.
	for (const { ast, scope } of [analysis.module, analysis.instance]) {
		walk(
			/** @type {ESTree.Node} */ (ast),
			{ scope },
			{
				_(node, context) {
					context.next({ scope: scope_for(node, context.state.scope) });
				},
				VariableDeclarator(node, { state, next }) {
					if (
						node.init?.type === 'CallExpression' &&
						node.init.callee.type !== 'Super' &&
						imported(node.init.callee, 'createContext', state.scope) &&
						node.id.type === 'ArrayPattern'
					) {
						const element = node.id.elements[1];
						const id = element?.type === 'AssignmentPattern' ? element.left : element;
						const binding = id?.type === 'Identifier' && state.scope.get(id.name);
						if (binding) setters.add(binding);
					}
					if (node.init && node.id.type === 'ObjectPattern' && namespace(node.init, state.scope)) {
						for (const property of node.id.properties) {
							if (property.type !== 'Property') continue;
							const name =
								property.key.type === 'Identifier'
									? property.key.name
									: property.key.type === 'Literal'
										? property.key.value
										: null;
							if (name !== 'setContext' || property.value.type !== 'Identifier') continue;
							const binding = state.scope.get(property.value.name);
							if (binding) setters.add(binding);
						}
					}
					next();
				}
			}
		);
	}

	/** @type {Set<ESTree.Node>} */
	const seen = new Set();
	/** @param {ESTree.Node} node @param {Scope} scope */
	function inspect(node, scope) {
		if (seen.has(node) || mutation) return;
		seen.add(node);
		walk(
			node,
			{ scope },
			{
				_(node, context) {
					if (!mutation) context.next({ scope: scope_for(node, context.state.scope) });
				},
				Identifier(node, { state, path }) {
					if (state.scope.get(node.name)?.node === node) return;
					const parent = path.at(-1);
					if ((!parent || is_reference(node, parent)) && setter(node, state.scope)) mutation = node;
				},
				MemberExpression(node, { state, next }) {
					if (
						setter(node, state.scope) ||
						(['set', 'delete', 'clear'].includes(/** @type {string} */ (key(node))) &&
							node.object.type !== 'Super' &&
							context_map(node.object, state.scope))
					) {
						mutation = node;
					} else next();
				},
				CallExpression(node, { state, next }) {
					if (node.callee.type === 'Identifier') {
						const binding = state.scope.get(node.callee.name);
						const initial = binding?.initial;
						if (
							binding &&
							(initial?.type === 'FunctionDeclaration' ||
								initial?.type === 'FunctionExpression' ||
								initial?.type === 'ArrowFunctionExpression')
						) {
							inspect(initial, binding.scope);
						}
					}
					next();
				}
			}
		);
	}
	for (const node of prefix) inspect(node, analysis.instance.scope);
	return mutation;
}

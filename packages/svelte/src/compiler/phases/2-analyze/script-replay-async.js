/** @import * as ESTree from 'estree' */
/** @import { Binding } from '#compiler' */
/** @import { ComponentAnalysis } from '../types.js' */
/** @import { Scope } from '../scope.js' */
import { walk } from 'zimmerframe';
import { has_await_expression, object, unwrap_pattern } from '../../utils/ast.js';

/** @typedef {ESTree.FunctionDeclaration | ESTree.FunctionExpression | ESTree.ArrowFunctionExpression} Fn */
/** @typedef {{ node: ESTree.Node, scope: Scope, parameters: Map<Binding, Reference[]>, bound?: Reference[] }} Reference */
/** @typedef {{ node: Fn, scope: Scope, parameters: Map<Binding, Reference[]>, bound?: Reference[] }} FunctionReference */

const timers = new Set([
	'setTimeout',
	'setInterval',
	'setImmediate',
	'queueMicrotask',
	'requestAnimationFrame',
	'requestIdleCallback'
]);
const globals = new Set(['globalThis', 'window', 'self']);
const state_kinds = new Set([
	'state',
	'raw_state',
	'derived',
	'prop',
	'bindable_prop',
	'store_sub'
]);

/**
 * A foreign continuation does not inherit the synchronous initialization context.
 * Follow initializer-reachable helpers, not every function declared in the script:
 * an event handler or a callback merely registered with user code is not an
 * initialization continuation. This is a conservative, local call-graph check;
 * opaque imported/prop async helpers and dynamic callback flows are not proved.
 *
 * @param {ESTree.Node[]} roots
 * @param {ComponentAnalysis} analysis
 * @returns {ESTree.Node | null}
 */
export function find_deferred_state_write(roots, analysis) {
	/** @type {ESTree.Node | null} */
	let mutation = null;
	/** @type {Map<Fn, number>} */
	const active = new Map();

	/** @param {ESTree.Node} node @param {Scope} scope */
	const scope_for = (node, scope) =>
		analysis.instance.scopes.get(node) ?? analysis.module.scopes.get(node) ?? scope;

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

	/** @param {Reference} ref @param {Set<Binding>} [seen] @returns {Reference[]} */
	function values(ref, seen = new Set()) {
		const { node, scope, parameters } = ref;
		if (node.type === 'Identifier') {
			const binding = scope.get(node.name);
			if (!binding || seen.has(binding)) return [];
			seen.add(binding);
			const assigned =
				parameters.get(binding) ??
				binding.assignments.map(({ value, scope }) => ({ node: value, scope, parameters }));
			return assigned.flatMap((value) => values(value, new Set(seen)));
		}
		if (node.type === 'ConditionalExpression' || node.type === 'LogicalExpression') {
			const expressions =
				node.type === 'ConditionalExpression'
					? [node.consequent, node.alternate]
					: [node.left, node.right];
			return expressions.flatMap((node) => values({ node, scope, parameters }, new Set(seen)));
		}
		if (node.type === 'AssignmentExpression')
			return values({ node: node.right, scope, parameters }, seen);
		if (node.type === 'SequenceExpression')
			return values(
				{ node: node.expressions[node.expressions.length - 1], scope, parameters },
				seen
			);
		if (node.type === 'ChainExpression')
			return values({ node: node.expression, scope, parameters }, seen);
		if (
			node.type === 'CallExpression' &&
			node.callee.type === 'MemberExpression' &&
			key(node.callee) === 'bind'
		) {
			return values({ node: node.callee.object, scope, parameters }, seen).map((value) => ({
				...value,
				bound: [
					...(value.bound ?? []),
					...node.arguments.slice(1).map((node) => ({ node, scope, parameters }))
				]
			}));
		}
		if (node.type === 'MemberExpression') {
			const name = key(node);
			return values({ node: node.object, scope, parameters }, seen).flatMap((value) => {
				if (value.node.type !== 'ObjectExpression') return [];
				const property = value.node.properties.find(
					(property) =>
						property.type === 'Property' &&
						!property.computed &&
						(property.key.type === 'Identifier'
							? property.key.name
							: property.key.type === 'Literal'
								? property.key.value
								: null) === name
				);
				return property?.type === 'Property' && property.kind === 'init'
					? values({ ...value, node: property.value }, new Set(seen))
					: [];
			});
		}
		return [ref];
	}

	/** @param {Reference} ref @returns {FunctionReference[]} */
	function functions(ref) {
		return /** @type {FunctionReference[]} */ (
			values(ref).filter(
				({ node }) =>
					node.type === 'FunctionDeclaration' ||
					node.type === 'FunctionExpression' ||
					node.type === 'ArrowFunctionExpression'
			)
		);
	}

	/** @param {ESTree.Expression | ESTree.Super} node @param {Scope} scope @param {Set<Binding>} [seen] @returns {string | null} */
	function builtin(node, scope, seen = new Set()) {
		if (node.type === 'Identifier') {
			const binding = scope.get(node.name);
			if (!binding) return node.name;
			if (seen.has(binding)) return null;
			seen.add(binding);
			const initial = binding.initial;
			if (
				initial?.type === 'ImportDeclaration' &&
				['timers', 'node:timers'].includes(/** @type {string} */ (initial.source.value))
			) {
				const specifier = initial.specifiers.find(
					(specifier) => specifier.type === 'ImportSpecifier' && specifier.local.name === node.name
				);
				return specifier?.type === 'ImportSpecifier'
					? /** @type {string} */ (
							specifier.imported.type === 'Identifier'
								? specifier.imported.name
								: specifier.imported.value
						)
					: null;
			}
			return initial?.type === 'Identifier' || initial?.type === 'MemberExpression'
				? builtin(initial, binding.scope, seen)
				: null;
		}
		if (node.type === 'MemberExpression' && node.object.type === 'Identifier') {
			const name = key(node);
			const receiver = builtin(node.object, scope, seen);
			if (
				typeof name === 'string' &&
				receiver &&
				(globals.has(receiver) || (receiver === 'process' && name === 'nextTick'))
			)
				return name;
		}
		return null;
	}

	/** @param {Reference} ref @param {Set<Binding>} [seen] @returns {boolean} */
	function state_value(ref, seen = new Set()) {
		if (ref.node.type === 'Identifier') {
			const binding = ref.scope.get(ref.node.name);
			if (!binding || seen.has(binding)) return false;
			if (state_kinds.has(binding.kind) || binding.kind === 'rest_prop') return true;
			seen.add(binding);
			const assigned =
				ref.parameters.get(binding) ??
				binding.assignments.map(({ value, scope }) => ({
					node: value,
					scope,
					parameters: ref.parameters
				}));
			return assigned.some((value) => state_value(value, new Set(seen)));
		}
		if (ref.node.type === 'MemberExpression')
			return state_value({ ...ref, node: ref.node.object }, seen);
		if (ref.node.type === 'ObjectExpression')
			return ref.node.properties.some(
				(property) =>
					property.type === 'Property' &&
					property.kind === 'init' &&
					state_value({ ...ref, node: property.value }, new Set(seen))
			);
		if (ref.node.type === 'ArrayExpression')
			return ref.node.elements.some((node) => node && state_value({ ...ref, node }, new Set(seen)));
		return false;
	}

	/** @param {ESTree.Pattern | ESTree.Expression} pattern @param {Scope} scope @param {Map<Binding, Reference[]>} parameters */
	function writes_state(pattern, scope, parameters) {
		return unwrap_pattern(/** @type {ESTree.Pattern} */ (pattern)).some((target) => {
			const id = object(target);
			const binding = id && scope.get(id.name);
			if (!binding || !id) return false;
			// Reassigning a plain argument is not a write to the caller's state value.
			return target.type === 'Identifier'
				? state_kinds.has(binding.kind)
				: state_value({ node: id, scope, parameters });
		});
	}

	/** @param {FunctionReference} ref @param {Reference[]} args @param {boolean} deferred */
	function invoke(ref, args, deferred) {
		const fn = ref.node;
		args = [...(ref.bound ?? []), ...args];
		// Deliberately not path-sensitive: any writer in an async helper containing
		// its own await is outside the currently proved initialization subset.
		deferred ||= !!fn.async && has_await_expression(fn.body);
		const bit = deferred ? 2 : 1;
		const previous = active.get(fn) ?? 0;
		if ((previous & bit) !== 0 || mutation) return;
		active.set(fn, previous | bit);
		const scope = scope_for(fn, ref.scope);
		const parameters = new Map(ref.parameters);
		try {
			for (let i = 0; i < fn.params.length; i++) {
				const param = fn.params[i];
				const id = param.type === 'AssignmentPattern' ? param.left : param;
				if (id.type !== 'Identifier') continue;
				const binding = scope.get(id.name);
				if (!binding) continue;
				const candidates = args[i] ? [args[i]] : [];
				if (param.type === 'AssignmentPattern') {
					candidates.push({ node: param.right, scope, parameters });
					scan(param.right, scope, parameters, deferred);
				}
				parameters.set(binding, candidates);
			}
			scan(fn.body, scope, parameters, deferred);
		} finally {
			active.set(fn, previous);
		}
	}

	/** @param {ESTree.Node} node @param {Scope} scope @param {Map<Binding, Reference[]>} parameters @param {boolean} deferred */
	function scan(node, scope, parameters, deferred) {
		if (mutation) return;
		walk(
			node,
			{ scope },
			{
				_(node, context) {
					if (!mutation) context.next({ scope: scope_for(node, context.state.scope) });
				},
				// Declarations and callback values are not executions. Enter them only
				// through a known call/scheduling edge, never just from the script's AST.
				FunctionDeclaration() {},
				FunctionExpression() {},
				ArrowFunctionExpression() {},
				AssignmentExpression(node, { state, next }) {
					if (deferred && writes_state(node.left, state.scope, parameters)) mutation = node;
					else next();
				},
				UpdateExpression(node, { state, next }) {
					if (deferred && writes_state(node.argument, state.scope, parameters)) mutation = node;
					else next();
				},
				CallExpression(node, { state, next }) {
					const ref = /** @param {ESTree.Node} node */ (node) => ({
						node,
						scope: state.scope,
						parameters
					});
					const args = node.arguments.map(ref);
					const name = builtin(node.callee, state.scope);
					const method = node.callee.type === 'MemberExpression' ? key(node.callee) : null;
					let callback_count = 0;
					if (method === 'then') callback_count = 2;
					else if (
						method === 'catch' ||
						method === 'finally' ||
						(name && (timers.has(name) || name === 'nextTick'))
					)
						callback_count = 1;
					if (callback_count) {
						const forwarded =
							name === 'setTimeout' || name === 'setInterval'
								? args.slice(2)
								: name === 'setImmediate' || name === 'nextTick'
									? args.slice(1)
									: [];
						for (const arg of args.slice(0, callback_count)) {
							for (const callback of functions(arg)) invoke(callback, forwarded, true);
						}
					} else {
						for (const callee of functions(ref(node.callee))) invoke(callee, args, deferred);
					}
					next();
				},
				NewExpression(node, { state, next }) {
					const ref = /** @param {ESTree.Node} node */ (node) => ({
						node,
						scope: state.scope,
						parameters
					});
					const args = node.arguments.map(ref);
					if (builtin(node.callee, state.scope) === 'Promise' && args[0]) {
						// Promise executors run synchronously; only callbacks they schedule
						// inherit a deferred classification.
						for (const executor of functions(args[0])) invoke(executor, [], deferred);
					} else {
						for (const callee of functions(ref(node.callee))) invoke(callee, args, deferred);
					}
					next();
				}
			}
		);
	}

	for (const node of roots) scan(node, analysis.instance.scope, new Map(), false);
	return mutation;
}

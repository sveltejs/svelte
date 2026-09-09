/** @import { BlockStatement, Expression, Identifier } from 'estree' */
/** @import { Binding } from '#compiler' */
/** @import { ClientTransformState, ComponentClientTransformState } from './types.js' */
/** @import { Analysis } from '../../types.js' */
/** @import { ExpressionMetadata } from '../../nodes.js' */
/** @import { Scope } from '../../scope.js' */
import * as b from '#compiler/builders';
import { is_event_attribute, is_simple_expression, save } from '../../../utils/ast.js';
import {
	PROPS_IS_LAZY_INITIAL,
	PROPS_IS_IMMUTABLE,
	PROPS_IS_RUNES,
	PROPS_IS_UPDATED,
	PROPS_IS_BINDABLE,
	PROPS_IS_RETAINED
} from '../../../../constants.js';
import { get_rune } from '../../scope.js';

/**
 * @param {Binding} binding
 * @param {Analysis} analysis
 * @returns {boolean}
 */
export function is_state_source(binding, analysis) {
	return (
		(binding.kind === 'state' || binding.kind === 'raw_state') &&
		(!analysis.immutable || binding.reassigned || analysis.accessors)
	);
}

/**
 * @param {Identifier} node
 * @param {ClientTransformState} state
 * @returns {Expression}
 */
export function build_getter(node, state) {
	if (Object.hasOwn(state.transform, node.name)) {
		const binding = state.scope.get(node.name);

		// don't transform the declaration itself
		if (node !== binding?.node) {
			return state.transform[node.name].read(node);
		}
	}

	return node;
}

/**
 * @param {Binding} binding
 * @param {ClientTransformState} state
 */
export function prop_binding_may_be_in_teardown(binding, state) {
	return ((binding.metadata ??= {}).prop_read_may_be_in_teardown ??= binding.references.some(
		(reference) => reference_may_be_in_teardown(reference, state, new Set())
	));
}

/**
 * @param {Binding['references'][number]} reference
 * @param {ClientTransformState} state
 * @param {Set<Binding>} checked
 */
function reference_may_be_in_teardown(reference, state, checked) {
	const { path } = reference;

	for (let i = path.length - 1; i >= 0; i -= 1) {
		const fn = path[i];

		if (
			fn.type !== 'ArrowFunctionExpression' &&
			fn.type !== 'FunctionExpression' &&
			fn.type !== 'FunctionDeclaration'
		) {
			continue;
		}

		const parent = path[i - 1];

		if (parent?.type === 'CallExpression') {
			// An IIFE executes in the same context as the function containing it.
			if (parent.callee === fn) continue;

			if (parent.arguments.includes(/** @type {Expression} */ (fn))) {
				const scope = get_scope(path, i - 1, state);
				if (is_save_svelte_import_call(parent, scope)) return false;

				const rune = get_rune(parent, scope);

				if (is_effect_rune(rune)) return false;
				if (rune === '$derived.by') {
					return derived_may_be_read_in_teardown(parent, path, i - 1, state, checked);
				}
			}
		}

		if (is_safe_element_event_handler(path, i)) return false;

		const function_binding = get_function_binding(fn, path, i, state);
		return function_binding === null
			? true
			: function_may_be_called_in_teardown(function_binding, state, checked);
	}

	for (let i = path.length - 1; i >= 0; i -= 1) {
		const node = path[i];
		if (node.type !== 'CallExpression') continue;

		const rune = get_rune(node, get_scope(path, i, state));
		if (rune === '$derived' || rune === '$derived.by') {
			return derived_may_be_read_in_teardown(node, path, i, state, checked);
		}
	}

	return false;
}

/**
 * @param {Binding} binding
 * @param {ClientTransformState} state
 * @param {Set<Binding>} checked
 */
function function_may_be_called_in_teardown(binding, state, checked) {
	if (checked.has(binding)) return false;
	checked.add(binding);

	for (const reference of binding.references) {
		if (reference.node === binding.node) continue;

		const parent = reference.path.at(-1);

		if (parent?.type !== 'CallExpression') {
			if (is_safe_element_event_handler(reference.path, reference.path.length)) continue;
			return true;
		}

		if (parent.callee === reference.node) {
			if (reference_may_be_in_teardown(reference, state, checked)) return true;
			continue;
		}

		if (!parent.arguments.includes(reference.node)) return true;

		const scope = get_scope(reference.path, reference.path.length - 1, state);
		if (is_save_svelte_import_call(parent, scope)) continue;

		const rune = get_rune(parent, scope);

		if (is_effect_rune(rune)) continue;
		if (
			rune === '$derived.by' &&
			!derived_may_be_read_in_teardown(
				parent,
				reference.path,
				reference.path.length - 1,
				state,
				checked
			)
		) {
			continue;
		}

		return true;
	}

	return false;
}

/**
 * @param {import('estree').CallExpression} call
 * @param {import('#compiler').AST.SvelteNode[]} path
 * @param {number} index
 * @param {ClientTransformState} state
 * @param {Set<Binding>} checked
 */
function derived_may_be_read_in_teardown(call, path, index, state, checked) {
	const parent = path[index - 1];
	if (parent?.type !== 'VariableDeclarator' || parent.init !== call) return true;
	if (parent.id.type !== 'Identifier') return true;

	const binding = get_scope(path, index - 1, state).get(parent.id.name);
	if (binding === null || checked.has(binding)) return false;

	checked.add(binding);

	for (const reference of binding.references) {
		if (reference.node === binding.node) continue;
		if (reference_may_be_in_teardown(reference, state, checked)) return true;
	}

	return false;
}

/**
 * @param {import('estree').FunctionDeclaration | import('estree').FunctionExpression | import('estree').ArrowFunctionExpression} fn
 * @param {import('#compiler').AST.SvelteNode[]} path
 * @param {number} index
 * @param {ClientTransformState} state
 * @returns {Binding | null}
 */
function get_function_binding(fn, path, index, state) {
	if (fn.type === 'FunctionDeclaration' && fn.id !== null) {
		return get_scope(path, index - 1, state).get(fn.id.name);
	}

	const parent = path[index - 1];
	if (
		parent?.type === 'VariableDeclarator' &&
		parent.init === fn &&
		parent.id.type === 'Identifier'
	) {
		return get_scope(path, index - 1, state).get(parent.id.name);
	}

	return null;
}

/**
 * @param {import('#compiler').AST.SvelteNode[]} path
 * @param {number} index
 * @param {ClientTransformState} state
 */
function get_scope(path, index, state) {
	for (let i = index; i >= 0; i -= 1) {
		const scope = state.scopes.get(path[i]);
		if (scope !== undefined) return scope;
	}

	return state.scope;
}

/** @param {string | null} rune */
function is_effect_rune(rune) {
	return rune === '$effect' || rune === '$effect.pre' || rune === '$effect.root';
}

/**
 * @param {import('estree').CallExpression} call
 * @param {Scope} scope
 */
function is_save_svelte_import_call(call, scope) {
	if (call.callee.type === 'Identifier') {
		return (
			is_svelte_import(scope.get(call.callee.name), call.callee.name, 'untrack') ||
			is_svelte_import(scope.get(call.callee.name), call.callee.name, 'hydratable')
		);
	}

	if (
		call.callee.type === 'MemberExpression' &&
		call.callee.object.type === 'Identifier' &&
		((!call.callee.computed &&
			call.callee.property.type === 'Identifier' &&
			(call.callee.property.name === 'untrack' || call.callee.property.name === 'hydratable')) ||
			(call.callee.computed &&
				call.callee.property.type === 'Literal' &&
				(call.callee.property.value === 'untrack' || call.callee.property.value === 'hydratable')))
	) {
		return is_svelte_import(scope.get(call.callee.object.name), call.callee.object.name, null);
	}

	return false;
}

/**
 * @param {Binding | null} binding
 * @param {string} local_name
 * @param {string | null} imported_name
 */
function is_svelte_import(binding, local_name, imported_name) {
	if (binding?.initial?.type !== 'ImportDeclaration' || binding.initial.source.value !== 'svelte') {
		return false;
	}

	return binding.initial.specifiers.some((specifier) => {
		if (specifier.local.name !== local_name) return false;
		if (imported_name === null) return specifier.type === 'ImportNamespaceSpecifier';

		return (
			specifier.type === 'ImportSpecifier' &&
			specifier.imported.type === 'Identifier' &&
			specifier.imported.name === imported_name
		);
	});
}

/**
 * @param {import('#compiler').AST.SvelteNode[]} path
 * @param {number} index
 */
function is_safe_element_event_handler(path, index) {
	for (let i = index - 1; i >= 0; i -= 1) {
		const node = path[i];

		if (
			node.type === 'ArrowFunctionExpression' ||
			node.type === 'FunctionExpression' ||
			node.type === 'FunctionDeclaration' ||
			node.type === 'CallExpression' ||
			node.type === 'NewExpression' ||
			node.type === 'SpreadAttribute'
		) {
			return false;
		}

		if (node.type === 'Attribute') {
			if (!is_event_attribute(node)) return false;

			const element = path[i - 1];
			return (
				(element?.type === 'RegularElement' || element?.type === 'SvelteElement') &&
				is_safe_event_name(node.name.slice(2))
			);
		}

		if (node.type === 'OnDirective') {
			const element = path[i - 1];
			return (
				(element?.type === 'RegularElement' || element?.type === 'SvelteElement') &&
				is_safe_event_name(node.name)
			);
		}
	}

	return false;
}

/** @param {string} name */
function is_safe_event_name(name) {
	if (name.endsWith('capture')) name = name.slice(0, -7);
	return name !== 'blur' && name !== 'focusout';
}

/**
 * @param {Binding} binding
 * @param {ComponentClientTransformState} state
 * @param {string} name
 * @param {Expression | null} [initial]
 * @returns
 */
export function get_prop_source(binding, state, name, initial) {
	/** @type {Expression[]} */
	const args = [b.id('$$props'), b.literal(name)];

	let flags = 0;

	if (binding.kind === 'bindable_prop') {
		flags |= PROPS_IS_BINDABLE;
	}

	if (state.analysis.immutable) {
		flags |= PROPS_IS_IMMUTABLE;
	}

	if (state.analysis.runes) {
		flags |= PROPS_IS_RUNES;
	}

	if (state.analysis.runes && prop_binding_may_be_in_teardown(binding, state)) {
		flags |= PROPS_IS_RETAINED;
	}

	if (
		state.analysis.accessors ||
		(state.analysis.immutable
			? binding.reassigned || (state.analysis.runes && binding.mutated)
			: binding.updated)
	) {
		flags |= PROPS_IS_UPDATED;
	}

	/** @type {Expression | undefined} */
	let arg;

	if (initial) {
		// To avoid eagerly evaluating the right-hand-side, we wrap it in a thunk if necessary
		if (is_simple_expression(initial)) {
			arg = initial;
		} else {
			if (
				initial.type === 'CallExpression' &&
				initial.callee.type === 'Identifier' &&
				initial.arguments.length === 0
			) {
				arg = initial.callee;
			} else {
				arg = b.thunk(initial);
			}

			flags |= PROPS_IS_LAZY_INITIAL;
		}
	}

	if (flags || arg) {
		args.push(b.literal(flags));
		if (arg) args.push(arg);
	}

	return b.call('$.prop', ...args);
}

/**
 *
 * @param {Binding} binding
 * @param {ClientTransformState} state
 * @returns
 */
export function is_prop_source(binding, state) {
	return (
		(binding.kind === 'prop' || binding.kind === 'bindable_prop') &&
		(!state.analysis.runes ||
			state.analysis.accessors ||
			binding.reassigned ||
			binding.initial ||
			// Until legacy mode is gone, we also need to use the prop source when only mutated is true,
			// because the parent could be a legacy component which needs coarse-grained reactivity
			binding.updated ||
			prop_binding_may_be_in_teardown(binding, state))
	);
}

/**
 * @param {Expression} node
 * @param {Scope | null} scope
 */
export function should_proxy(node, scope) {
	if (
		!node ||
		node.type === 'Literal' ||
		node.type === 'TemplateLiteral' ||
		node.type === 'ArrowFunctionExpression' ||
		node.type === 'FunctionExpression' ||
		node.type === 'UnaryExpression' ||
		node.type === 'BinaryExpression' ||
		(node.type === 'Identifier' && node.name === 'undefined')
	) {
		return false;
	}

	if (node.type === 'Identifier' && scope !== null) {
		const binding = scope.get(node.name);
		// Let's see if the reference is something that can be proxied
		if (
			binding !== null &&
			!binding.reassigned &&
			binding.initial !== null &&
			binding.initial.type !== 'FunctionDeclaration' &&
			binding.initial.type !== 'ClassDeclaration' &&
			binding.initial.type !== 'ImportDeclaration' &&
			binding.initial.type !== 'EachBlock' &&
			binding.initial.type !== 'SnippetBlock'
		) {
			return should_proxy(binding.initial, null);
		}
	}

	return true;
}

/**
 * An async thunk. If an `await` inside restores the reaction context via `$.save`,
 * the body exits through `$.unsave` so the context cannot leak into foreign microtasks
 * that run before the returned promise settles
 * @param {Expression | BlockStatement} body
 * @param {ExpressionMetadata} metadata
 */
export function async_thunk(body, metadata) {
	if (!metadata.has_pickled_await) {
		return b.arrow([], body, true);
	}

	const block = body.type === 'BlockStatement' ? body : b.block([b.return(body)]);

	return b.arrow(
		[],
		b.block([
			{
				type: 'TryStatement',
				block,
				handler: null,
				finalizer: b.block([b.stmt(b.call('$.unsave'))])
			}
		]),
		true
	);
}

/**
 * Svelte legacy mode should use safe equals in most places, runes mode shouldn't
 * @param {ComponentClientTransformState} state
 * @param {Expression | BlockStatement} expression
 * @param {ExpressionMetadata} [metadata]
 */
export function create_derived(state, expression, metadata) {
	if (metadata?.has_await) {
		return save(b.call('$.async_derived', async_thunk(expression, metadata)));
	}

	return b.call(state.analysis.runes ? '$.derived' : '$.derived_safe_equal', b.thunk(expression));
}

/**
 * @param {Scope} scope
 * @param {ClientTransformState} state
 */
export function get_transform(scope, state) {
	const transform = { ...state.transform };

	for (const [name, binding] of scope.declarations) {
		if (
			binding.kind === 'normal' ||
			// Reads of `$state(...)` declarations are not
			// transformed if they are never reassigned
			(binding.kind === 'state' && !is_state_source(binding, state.analysis))
		) {
			delete transform[name];
		}
	}

	return transform;
}

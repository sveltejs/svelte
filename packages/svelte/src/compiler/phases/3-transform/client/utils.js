/** @import { BlockStatement, Expression, Identifier } from 'estree' */
/** @import { Binding } from '#compiler' */
/** @import { ClientTransformState, ComponentClientTransformState } from './types.js' */
/** @import { Analysis } from '../../types.js' */
/** @import { ExpressionMetadata } from '../../nodes.js' */
/** @import { Scope } from '../../scope.js' */
import * as b from '#compiler/builders';
import { is_simple_expression, save } from '../../../utils/ast.js';
import {
	PROPS_IS_LAZY_INITIAL,
	PROPS_IS_IMMUTABLE,
	PROPS_IS_RUNES,
	PROPS_IS_UPDATED,
	PROPS_IS_BINDABLE
} from '../../../../constants.js';

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
			binding.updated)
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

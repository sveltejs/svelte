/** @import { ArrowFunctionExpression, Expression, CallExpression, VariableDeclarator, FunctionDeclaration, FunctionExpression, Identifier, Pattern, PrivateIdentifier, Statement, VariableDeclaration, ModuleDeclaration, Directive } from 'estree' */
/** @import { AST, Binding } from '#compiler' */
/** @import { ClientTransformState, ComponentClientTransformState, ComponentContext } from './types.js' */
/** @import { Analysis } from '../../types.js' */
/** @import { Scope } from '../../scope.js' */
import * as b from '../../../utils/builders.js';
import { extract_identifiers, is_simple_expression } from '../../../utils/ast.js';
import { get_rune } from '../../scope.js';
import {
	PROPS_IS_LAZY_INITIAL,
	PROPS_IS_IMMUTABLE,
	PROPS_IS_RUNES,
	PROPS_IS_UPDATED,
	PROPS_IS_BINDABLE
} from '../../../../constants.js';
import { dev } from '../../../state.js';
import { get_value } from './visitors/shared/declarations.js';

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
 * @param {Expression} value
 * @param {Expression} previous
 */
export function build_proxy_reassignment(value, previous) {
	return dev ? b.call('$.proxy', value, b.null, previous) : b.call('$.proxy', value);
}

/**
 * @param {FunctionDeclaration | FunctionExpression | ArrowFunctionExpression} node
 * @param {ComponentContext} context
 * @returns {Pattern[]}
 */
function get_hoisted_params(node, context) {
	const scope = context.state.scope;

	/** @type {Identifier[]} */
	const params = [];

	/**
	 * We only want to push if it's not already present to avoid name clashing
	 * @param {Identifier} id
	 */
	function push_unique(id) {
		if (!params.find((param) => param.name === id.name)) {
			params.push(id);
		}
	}

	for (const [reference] of scope.references) {
		let binding = scope.get(reference);

		if (binding !== null && !scope.declarations.has(reference) && binding.initial !== node) {
			if (binding.kind === 'store_sub') {
				// We need both the subscription for getting the value and the store for updating
				push_unique(b.id(binding.node.name));
				binding = /** @type {Binding} */ (scope.get(binding.node.name.slice(1)));
			}

			let expression = context.state.transform[reference]?.read(b.id(binding.node.name));

			if (
				// If it's a destructured derived binding, then we can extract the derived signal reference and use that.
				// TODO this code is bad, we need to kill it
				expression != null &&
				typeof expression !== 'function' &&
				expression.type === 'MemberExpression' &&
				expression.object.type === 'CallExpression' &&
				expression.object.callee.type === 'Identifier' &&
				expression.object.callee.name === '$.get' &&
				expression.object.arguments[0].type === 'Identifier'
			) {
				push_unique(b.id(expression.object.arguments[0].name));
			} else if (
				// If we are referencing a simple $$props value, then we need to reference the object property instead
				(binding.kind === 'prop' || binding.kind === 'bindable_prop') &&
				!is_prop_source(binding, context.state)
			) {
				push_unique(b.id('$$props'));
			} else if (
				// imports don't need to be hoisted
				binding.declaration_kind !== 'import'
			) {
				// create a copy to remove start/end tags which would mess up source maps
				push_unique(b.id(binding.node.name));
				// rest props are often accessed through the $$props object for optimization reasons,
				// but we can't know if the delegated event handler will use it, so we need to add both as params
				if (binding.kind === 'rest_prop' && context.state.analysis.runes) {
					push_unique(b.id('$$props'));
				}
			}
		}
	}
	return params;
}

/**
 * @param {FunctionDeclaration | FunctionExpression | ArrowFunctionExpression} node
 * @param {ComponentContext} context
 * @returns {Pattern[]}
 */
export function build_hoisted_params(node, context) {
	const hoisted_params = get_hoisted_params(node, context);
	node.metadata.hoisted_params = hoisted_params;

	/** @type {Pattern[]} */
	const params = [];

	if (node.params.length === 0) {
		if (hoisted_params.length > 0) {
			// For the event object
			params.push(b.id(context.state.scope.generate('_')));
		}
	} else {
		for (const param of node.params) {
			params.push(/** @type {Pattern} */ (context.visit(param)));
		}
	}

	params.push(...hoisted_params);
	return params;
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
 * @param {Pattern} node
 * @param {import('zimmerframe').Context<AST.SvelteNode, ComponentClientTransformState>} context
 * @returns {{ id: Pattern, declarations: null | Statement[] }}
 */
export function create_derived_block_argument(node, context) {
	if (node.type === 'Identifier') {
		context.state.transform[node.name] = { read: get_value };
		return { id: node, declarations: null };
	}

	const pattern = /** @type {Pattern} */ (context.visit(node));
	const identifiers = extract_identifiers(node);

	const id = b.id('$$source');
	const value = b.id('$$value');

	const block = b.block([
		b.var(pattern, b.call('$.get', id)),
		b.return(b.object(identifiers.map((identifier) => b.prop('init', identifier, identifier))))
	]);

	const declarations = [b.var(value, create_derived(context.state, b.thunk(block)))];

	for (const id of identifiers) {
		context.state.transform[id.name] = { read: get_value };

		declarations.push(
			b.var(id, create_derived(context.state, b.thunk(b.member(b.call('$.get', value), id))))
		);
	}

	return { id, declarations };
}

/**
 * Svelte legacy mode should use safe equals in most places, runes mode shouldn't
 * @param {ComponentClientTransformState} state
 * @param {Expression} arg
 */
export function create_derived(state, arg) {
	return b.call(state.analysis.runes ? '$.derived' : '$.derived_safe_equal', arg);
}

/**
 * @param {(ModuleDeclaration | Statement | Directive)[]} statements
 * @param {ComponentContext} context
 * @returns {[(ModuleDeclaration | Statement | Directive)[], null | (ModuleDeclaration | Statement | Directive)[]]}
 */
export function wrap_unsafe_async_statements(statements, context) {
	/** @type {(ModuleDeclaration | Statement | Directive)[]} */
	const new_statements = [];
	let target_block_statements = new_statements;
	let is_unsafe = true;

	const push_unsafe_statement = (/** @type {Statement} */ statement) => {
		if (is_unsafe) {
			const block_statments = [statement];
			const script_template = b.stmt(b.call('$.script_effect', b.thunk(b.block(block_statments))));
			target_block_statements.push(script_template);
			target_block_statements = block_statments;
			is_unsafe = false;
		} else {
			target_block_statements.push(statement);
		}
	};

	for (const statement of statements) {
		const visited = /** @type {Statement} */ (context.visit(statement));

		if (
			statement.type === 'FunctionDeclaration' ||
			statement.type === 'ClassDeclaration' ||
			statement.type === 'EmptyStatement' ||
			statement.type === 'ImportDeclaration' ||
			statement.type === 'ExportNamedDeclaration' ||
			statement.type === 'ExportAllDeclaration' ||
			statement.type === 'ExportDefaultDeclaration'
		) {
			target_block_statements.push(visited);
			continue;
		}

		if (statement.type === 'VariableDeclaration') {
			if (statement.declarations.length === 1) {
				const declarator = statement.declarations[0];
				const init = declarator.init;

				// Safe declaration
				if (
					init == null ||
					init.type === 'Literal' ||
					init.type === 'FunctionExpression' ||
					init.type === 'ArrowFunctionExpression' ||
					(init.type === 'ArrayExpression' && init.elements.length === 0) ||
					(init.type === 'ObjectExpression' && init.properties.length === 0)
				) {
					target_block_statements.push(visited);
					continue;
				}
				// Handle runes
				if (init.type === 'CallExpression') {
					const rune = get_rune(init, context.state.scope);

					if (rune === '$props' || rune === '$derived' || rune === '$derived.by') {
						target_block_statements.push(visited);
						continue;
					}
					if (rune === '$await') {
						target_block_statements.push(visited);
						is_unsafe = true;
						continue;
					}
				}
			}
			// TODO: we can probably better handle multiple declarators
			push_unsafe_statement(visited);
			continue;
		}

		if (statement.type === 'ExpressionStatement') {
			const expression = statement.expression;

			// Handle runes
			if (expression.type === 'CallExpression') {
				const rune = get_rune(expression, context.state.scope);

				if (rune === '$effect' || rune === '$effect.pre') {
					target_block_statements.push(visited);
					continue;
				}
			}

			// Assume all expression statement expressions are unsafe
			push_unsafe_statement(visited);
			continue;
		}

		// Assume all other top-level statements are unsafe
		push_unsafe_statement(visited);
	}

	return [
		new_statements,
		new_statements === target_block_statements ? null : target_block_statements
	];
}

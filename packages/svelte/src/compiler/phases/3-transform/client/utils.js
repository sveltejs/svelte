/** @import { ArrowFunctionExpression, AssignmentExpression, BinaryOperator, Expression, FunctionDeclaration, FunctionExpression, Identifier, MemberExpression, Node, Pattern, PrivateIdentifier, Statement } from 'estree' */
/** @import { Binding, SvelteNode } from '#compiler' */
/** @import { ClientTransformState, ComponentClientTransformState, ComponentContext } from './types.js' */
/** @import { Scope } from '../../scope.js' */
import * as b from '../../../utils/builders.js';
import {
	extract_identifiers,
	extract_paths,
	is_expression_async,
	is_simple_expression,
	object
} from '../../../utils/ast.js';
import {
	PROPS_IS_LAZY_INITIAL,
	PROPS_IS_IMMUTABLE,
	PROPS_IS_RUNES,
	PROPS_IS_UPDATED
} from '../../../../constants.js';
import { is_ignored, dev } from '../../../state.js';

/**
 * @template {ClientTransformState} State
 * @param {AssignmentExpression} node
 * @param {import('zimmerframe').Context<SvelteNode, State>} context
 * @returns
 */
export function get_assignment_value(node, { state, visit }) {
	if (node.left.type === 'Identifier') {
		const operator = node.operator;
		return operator === '='
			? /** @type {Expression} */ (visit(node.right))
			: // turn something like x += 1 into x = x + 1
				b.binary(
					/** @type {BinaryOperator} */ (operator.slice(0, -1)),
					build_getter(node.left, state),
					/** @type {Expression} */ (visit(node.right))
				);
	} else if (
		node.left.type === 'MemberExpression' &&
		node.left.object.type === 'ThisExpression' &&
		node.left.property.type === 'PrivateIdentifier' &&
		state.private_state.has(node.left.property.name)
	) {
		const operator = node.operator;
		return operator === '='
			? /** @type {Expression} */ (visit(node.right))
			: // turn something like x += 1 into x = x + 1
				b.binary(
					/** @type {BinaryOperator} */ (operator.slice(0, -1)),
					/** @type {Expression} */ (visit(node.left)),
					/** @type {Expression} */ (visit(node.right))
				);
	} else {
		return /** @type {Expression} */ (visit(node.right));
	}
}

/**
 * @param {Binding} binding
 * @param {ClientTransformState} state
 * @returns {boolean}
 */
export function is_state_source(binding, state) {
	return (
		(binding.kind === 'state' || binding.kind === 'frozen_state') &&
		(!state.analysis.immutable || binding.reassigned || state.analysis.accessors)
	);
}

/**
 * @param {Identifier} node
 * @param {ClientTransformState} state
 * @returns {Expression}
 */
export function build_getter(node, state) {
	const binding = state.scope.get(node.name);

	if (binding === null || node === binding.node) {
		// No associated binding or the declaration itself which shouldn't be transformed
		return node;
	}

	if (Object.hasOwn(state.getters, node.name)) {
		const getter = state.getters[node.name];
		return typeof getter === 'function' ? getter(node) : getter;
	}

	if (binding.node.name === '$$props') {
		// Special case for $$props which only exists in the old world
		return b.id('$$sanitized_props');
	}

	if (binding.kind === 'store_sub') {
		return b.call(node);
	}

	if (binding.kind === 'prop' || binding.kind === 'bindable_prop') {
		if (is_prop_source(binding, state)) {
			return b.call(node);
		}

		if (binding.prop_alias) {
			const key = b.key(binding.prop_alias);
			return b.member(b.id('$$props'), key, key.type === 'Literal');
		}
		return b.member(b.id('$$props'), node);
	}

	if (binding.kind === 'legacy_reactive_import') {
		return b.call('$$_import_' + node.name);
	}

	if (
		is_state_source(binding, state) ||
		binding.kind === 'derived' ||
		binding.kind === 'legacy_reactive'
	) {
		return b.call('$.get', node);
	}

	return node;
}

/**
 * @template {ClientTransformState} State
 * @param {AssignmentExpression} node
 * @param {import('zimmerframe').Context<SvelteNode, State>} context
 * @param {() => any} fallback
 * @param {boolean | null} [prefix] - If the assignment is a transformed update expression, set this. Else `null`
 * @param {{skip_proxy_and_freeze?: boolean}} [options]
 * @returns {Expression}
 */
export function build_setter(node, context, fallback, prefix, options) {
	const { state, visit } = context;

	const assignee = node.left;
	if (
		assignee.type === 'ArrayPattern' ||
		assignee.type === 'ObjectPattern' ||
		assignee.type === 'RestElement'
	) {
		// Turn assignment into an IIFE, so that `$.set` calls etc don't produce invalid code
		const tmp_id = context.state.scope.generate('tmp');

		/** @type {AssignmentExpression[]} */
		const original_assignments = [];

		/** @type {Expression[]} */
		const assignments = [];

		const paths = extract_paths(assignee);

		for (const path of paths) {
			const value = path.expression?.(b.id(tmp_id));
			const assignment = b.assignment('=', path.node, value);
			original_assignments.push(assignment);
			assignments.push(build_setter(assignment, context, () => assignment, prefix, options));
		}

		if (assignments.every((assignment, i) => assignment === original_assignments[i])) {
			// No change to output -> nothing to transform -> we can keep the original assignment
			return fallback();
		}

		const rhs_expression = /** @type {Expression} */ (visit(node.right));

		const iife_is_async =
			is_expression_async(rhs_expression) ||
			assignments.some((assignment) => is_expression_async(assignment));

		const iife = b.arrow(
			[],
			b.block([
				b.const(tmp_id, rhs_expression),
				b.stmt(b.sequence(assignments)),
				// return because it could be used in a nested expression where the value is needed.
				// example: { foo: ({ bar } = { bar: 1 })}
				b.return(b.id(tmp_id))
			])
		);

		if (iife_is_async) {
			return b.await(b.call(b.async(iife)));
		} else {
			return b.call(iife);
		}
	}

	if (assignee.type !== 'Identifier' && assignee.type !== 'MemberExpression') {
		throw new Error(`Unexpected assignment type ${assignee.type}`);
	}

	// Handle class private/public state assignment cases
	if (assignee.type === 'MemberExpression') {
		if (
			assignee.object.type === 'ThisExpression' &&
			assignee.property.type === 'PrivateIdentifier'
		) {
			const private_state = context.state.private_state.get(assignee.property.name);
			const value = get_assignment_value(node, context);
			if (private_state !== undefined) {
				if (state.in_constructor) {
					// See if we should wrap value in $.proxy
					if (
						context.state.analysis.runes &&
						!options?.skip_proxy_and_freeze &&
						should_proxy_or_freeze(value, context.state.scope)
					) {
						const assignment = fallback();
						if (assignment.type === 'AssignmentExpression') {
							assignment.right =
								private_state.kind === 'frozen_state'
									? b.call('$.freeze', value)
									: build_proxy_reassignment(value, private_state.id);
							return assignment;
						}
					}
				} else {
					return b.call(
						'$.set',
						assignee,
						context.state.analysis.runes &&
							!options?.skip_proxy_and_freeze &&
							should_proxy_or_freeze(value, context.state.scope)
							? private_state.kind === 'frozen_state'
								? b.call('$.freeze', value)
								: build_proxy_reassignment(value, private_state.id)
							: value
					);
				}
			}
		} else if (
			assignee.object.type === 'ThisExpression' &&
			assignee.property.type === 'Identifier' &&
			state.in_constructor
		) {
			const public_state = context.state.public_state.get(assignee.property.name);
			const value = get_assignment_value(node, context);
			// See if we should wrap value in $.proxy
			if (
				context.state.analysis.runes &&
				public_state !== undefined &&
				!options?.skip_proxy_and_freeze &&
				should_proxy_or_freeze(value, context.state.scope)
			) {
				const assignment = fallback();
				if (assignment.type === 'AssignmentExpression') {
					assignment.right =
						public_state.kind === 'frozen_state'
							? b.call('$.freeze', value)
							: build_proxy_reassignment(value, public_state.id);
					return assignment;
				}
			}
		}
	}

	const left = object(assignee);

	if (left === null) {
		return fallback();
	}

	const binding = state.scope.get(left.name);

	if (!binding) return fallback();

	if (Object.hasOwn(state.setters, left.name)) {
		const setter = state.setters[left.name];
		// @ts-expect-error
		return setter(node, context);
	}

	if (binding.kind === 'legacy_reactive_import') {
		return b.call(
			'$$_import_' + binding.node.name,
			b.assignment(
				node.operator,
				/** @type {Pattern} */ (visit(node.left)),
				/** @type {Expression} */ (visit(node.right))
			)
		);
	}

	/**
	 * @param {any} serialized
	 * @returns
	 */
	function maybe_skip_ownership_validation(serialized) {
		if (is_ignored(node, 'ownership_invalid_mutation')) {
			return b.call('$.skip_ownership_validation', b.thunk(serialized));
		}

		return serialized;
	}

	if (binding.kind === 'derived') {
		return maybe_skip_ownership_validation(fallback());
	}

	const is_store = binding.kind === 'store_sub';
	const left_name = is_store ? left.name.slice(1) : left.name;

	if (
		binding.kind !== 'state' &&
		binding.kind !== 'frozen_state' &&
		binding.kind !== 'prop' &&
		binding.kind !== 'bindable_prop' &&
		binding.kind !== 'each' &&
		binding.kind !== 'legacy_reactive' &&
		!is_store
	) {
		// TODO error if it's a computed (or rest prop)? or does that already happen elsewhere?
		return fallback();
	}

	const value = get_assignment_value(node, context);

	const serialize = () => {
		if (left === node.left) {
			const is_initial_proxy =
				binding.initial !== null &&
				should_proxy_or_freeze(/**@type {Expression}*/ (binding.initial), context.state.scope);
			if ((binding.kind === 'prop' || binding.kind === 'bindable_prop') && !is_initial_proxy) {
				return b.call(left, value);
			} else if (is_store) {
				return b.call('$.store_set', build_getter(b.id(left_name), state), value);
			} else {
				let call;
				if (binding.kind === 'state') {
					call = b.call(
						'$.set',
						b.id(left_name),
						context.state.analysis.runes &&
							!options?.skip_proxy_and_freeze &&
							should_proxy_or_freeze(value, context.state.scope)
							? build_proxy_reassignment(value, left_name)
							: value
					);
				} else if (binding.kind === 'frozen_state') {
					call = b.call(
						'$.set',
						b.id(left_name),
						context.state.analysis.runes &&
							!options?.skip_proxy_and_freeze &&
							should_proxy_or_freeze(value, context.state.scope)
							? b.call('$.freeze', value)
							: value
					);
				} else if (
					(binding.kind === 'prop' || binding.kind === 'bindable_prop') &&
					is_initial_proxy
				) {
					call = b.call(
						left,
						context.state.analysis.runes &&
							!options?.skip_proxy_and_freeze &&
							should_proxy_or_freeze(value, context.state.scope) &&
							binding.kind === 'bindable_prop'
							? build_proxy_reassignment(value, left_name)
							: value
					);
				} else {
					call = b.call('$.set', b.id(left_name), value);
				}

				if (state.scope.get(`$${left.name}`)?.kind === 'store_sub') {
					return b.call('$.store_unsub', call, b.literal(`$${left.name}`), b.id('$$stores'));
				} else {
					return call;
				}
			}
		} else {
			if (is_store) {
				// If we are assigning to a store property, we need to ensure we don't
				// capture the read for the store as part of the member expression to
				// keep consistency with how store $ shorthand reads work in Svelte 4.
				/**
				 *
				 * @param {Expression | Pattern} node
				 * @returns {Expression}
				 */
				function visit_node(node) {
					if (node.type === 'MemberExpression') {
						return {
							...node,
							object: visit_node(/** @type {Expression} */ (node.object)),
							property: /** @type {MemberExpression} */ (visit(node)).property
						};
					}
					if (node.type === 'Identifier') {
						const binding = state.scope.get(node.name);

						if (binding !== null && binding.kind === 'store_sub') {
							return b.call('$.untrack', b.thunk(/** @type {Expression} */ (visit(node))));
						}
					}
					return /** @type {Expression} */ (visit(node));
				}

				return maybe_skip_ownership_validation(
					b.call(
						'$.store_mutate',
						build_getter(b.id(left_name), state),
						b.assignment(node.operator, /** @type {Pattern}} */ (visit_node(node.left)), value),
						b.call('$.untrack', b.id('$' + left_name))
					)
				);
			} else if (
				!state.analysis.runes ||
				// this condition can go away once legacy mode is gone; only necessary for interop with legacy parent bindings
				(binding.mutated && binding.kind === 'bindable_prop')
			) {
				if (binding.kind === 'bindable_prop') {
					return maybe_skip_ownership_validation(
						b.call(
							left,
							b.assignment(node.operator, /** @type {Pattern} */ (visit(node.left)), value),
							b.true
						)
					);
				} else {
					return maybe_skip_ownership_validation(
						b.call(
							'$.mutate',
							b.id(left_name),
							b.assignment(node.operator, /** @type {Pattern} */ (visit(node.left)), value)
						)
					);
				}
			} else if (
				node.right.type === 'Literal' &&
				prefix != null &&
				(node.operator === '+=' || node.operator === '-=')
			) {
				return maybe_skip_ownership_validation(
					b.update(
						node.operator === '+=' ? '++' : '--',
						/** @type {Expression} */ (visit(node.left)),
						prefix
					)
				);
			} else {
				return maybe_skip_ownership_validation(
					b.assignment(
						node.operator,
						/** @type {Pattern} */ (visit(node.left)),
						/** @type {Expression} */ (visit(node.right))
					)
				);
			}
		}
	};

	if (value.type === 'BinaryExpression' && /** @type {any} */ (value.operator) === '??') {
		return b.logical('??', build_getter(b.id(left_name), state), serialize());
	}

	return serialize();
}

/**
 * @param {Expression} value
 * @param {PrivateIdentifier | string} proxy_reference
 */
export function build_proxy_reassignment(value, proxy_reference) {
	return dev
		? b.call(
				'$.proxy',
				value,
				b.null,
				typeof proxy_reference === 'string'
					? b.id(proxy_reference)
					: b.member(b.this, proxy_reference)
			)
		: b.call('$.proxy', value);
}

/**
 * @param {FunctionDeclaration | FunctionExpression | ArrowFunctionExpression} node
 * @param {ComponentContext} context
 * @returns {Pattern[]}
 */
function get_hoistable_params(node, context) {
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

			const expression = context.state.getters[reference];

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
export function build_hoistable_params(node, context) {
	const hoistable_params = get_hoistable_params(node, context);
	node.metadata.hoistable_params = hoistable_params;

	/** @type {Pattern[]} */
	const params = [];

	if (node.params.length === 0) {
		if (hoistable_params.length > 0) {
			// For the event object
			params.push(b.id('_'));
		}
	} else {
		for (const param of node.params) {
			params.push(/** @type {Pattern} */ (context.visit(param)));
		}
	}

	params.push(...hoistable_params);
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
			: binding.mutated)
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
			binding.mutated)
	);
}

/**
 * @param {Expression} node
 * @param {Scope | null} scope
 */
export function should_proxy_or_freeze(node, scope) {
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
		// Let's see if the reference is something that can be proxied or frozen
		if (
			binding !== null &&
			!binding.reassigned &&
			binding.initial !== null &&
			binding.initial.type !== 'FunctionDeclaration' &&
			binding.initial.type !== 'ClassDeclaration' &&
			binding.initial.type !== 'ImportDeclaration' &&
			binding.initial.type !== 'EachBlock'
		) {
			return should_proxy_or_freeze(binding.initial, null);
		}
	}
	return true;
}

/**
 * Port over the location information from the source to the target identifier.
 * but keep the target as-is (i.e. a new id is created).
 * This ensures esrap can generate accurate source maps.
 * @param {Identifier} target
 * @param {Identifier} source
 */
export function with_loc(target, source) {
	if (source.loc) {
		return { ...target, loc: source.loc };
	}
	return target;
}

/**
 * @param {Pattern} node
 * @param {import('zimmerframe').Context<SvelteNode, ComponentClientTransformState>} context
 * @returns {{ id: Pattern, declarations: null | Statement[] }}
 */
export function create_derived_block_argument(node, context) {
	if (node.type === 'Identifier') {
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

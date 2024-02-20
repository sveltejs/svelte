import * as b from '../../../utils/builders.js';
import { extract_paths, is_simple_expression, object } from '../../../utils/ast.js';
import { error } from '../../../errors.js';
import {
	PROPS_IS_LAZY_INITIAL,
	PROPS_IS_IMMUTABLE,
	PROPS_IS_RUNES,
	PROPS_IS_UPDATED
} from '../../../../constants.js';

/**
 * @template {import('./types').ClientTransformState} State
 * @param {import('estree').AssignmentExpression} node
 * @param {import('zimmerframe').Context<import('#compiler').SvelteNode, State>} context
 * @returns
 */
export function get_assignment_value(node, { state, visit }) {
	if (node.left.type === 'Identifier') {
		const operator = node.operator;
		return operator === '='
			? /** @type {import('estree').Expression} */ (visit(node.right))
			: // turn something like x += 1 into x = x + 1
				b.binary(
					/** @type {import('estree').BinaryOperator} */ (operator.slice(0, -1)),
					serialize_get_binding(node.left, state),
					/** @type {import('estree').Expression} */ (visit(node.right))
				);
	} else if (
		node.left.type === 'MemberExpression' &&
		node.left.object.type === 'ThisExpression' &&
		node.left.property.type === 'PrivateIdentifier' &&
		state.private_state.has(node.left.property.name)
	) {
		const operator = node.operator;
		return operator === '='
			? /** @type {import('estree').Expression} */ (visit(node.right))
			: // turn something like x += 1 into x = x + 1
				b.binary(
					/** @type {import('estree').BinaryOperator} */ (operator.slice(0, -1)),
					/** @type {import('estree').Expression} */ (visit(node.left)),
					/** @type {import('estree').Expression} */ (visit(node.right))
				);
	} else {
		return /** @type {import('estree').Expression} */ (visit(node.right));
	}
}

/**
 * @param {import('#compiler').Binding} binding
 * @param {import('./types').ClientTransformState} state
 * @returns {boolean}
 */
export function is_state_source(binding, state) {
	return (
		(binding.kind === 'state' || binding.kind === 'frozen_state') &&
		(!state.analysis.immutable || binding.reassigned || state.analysis.accessors)
	);
}

/**
 * @param {import('estree').Identifier} node
 * @param {import('./types').ClientTransformState} state
 * @returns {import('estree').Expression}
 */
export function serialize_get_binding(node, state) {
	const binding = state.scope.get(node.name);

	if (binding === null || node === binding.node) {
		// No associated binding or the declaration itself which shouldn't be transformed
		return node;
	}

	if (binding.kind === 'store_sub') {
		return b.call(node);
	}

	if (binding.expression) {
		return typeof binding.expression === 'function' ? binding.expression(node) : binding.expression;
	}

	if (binding.kind === 'prop') {
		if (binding.node.name === '$$props') {
			// Special case for $$props which only exists in the old world
			// TODO this probably shouldn't have a 'prop' binding kind
			return node;
		}

		if (
			state.analysis.accessors ||
			(state.analysis.immutable ? binding.reassigned : binding.mutated) ||
			binding.initial
		) {
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
 * @param {import('estree').Expression | import('estree').Pattern} expression
 * @returns {boolean}
 */
function is_expression_async(expression) {
	switch (expression.type) {
		case 'AwaitExpression': {
			return true;
		}
		case 'ArrayPattern': {
			return expression.elements.some((element) => element && is_expression_async(element));
		}
		case 'ArrayExpression': {
			return expression.elements.some((element) => {
				if (!element) {
					return false;
				} else if (element.type === 'SpreadElement') {
					return is_expression_async(element.argument);
				} else {
					return is_expression_async(element);
				}
			});
		}
		case 'AssignmentPattern':
		case 'AssignmentExpression':
		case 'BinaryExpression':
		case 'LogicalExpression': {
			return is_expression_async(expression.left) || is_expression_async(expression.right);
		}
		case 'CallExpression':
		case 'NewExpression': {
			return (
				(expression.callee.type !== 'Super' && is_expression_async(expression.callee)) ||
				expression.arguments.some((element) => {
					if (element.type === 'SpreadElement') {
						return is_expression_async(element.argument);
					} else {
						return is_expression_async(element);
					}
				})
			);
		}
		case 'ChainExpression': {
			return is_expression_async(expression.expression);
		}
		case 'ConditionalExpression': {
			return (
				is_expression_async(expression.test) ||
				is_expression_async(expression.alternate) ||
				is_expression_async(expression.consequent)
			);
		}
		case 'ImportExpression': {
			return is_expression_async(expression.source);
		}
		case 'MemberExpression': {
			return (
				(expression.object.type !== 'Super' && is_expression_async(expression.object)) ||
				(expression.property.type !== 'PrivateIdentifier' &&
					is_expression_async(expression.property))
			);
		}
		case 'ObjectPattern':
		case 'ObjectExpression': {
			return expression.properties.some((property) => {
				if (property.type === 'SpreadElement') {
					return is_expression_async(property.argument);
				} else if (property.type === 'Property') {
					return (
						(property.key.type !== 'PrivateIdentifier' && is_expression_async(property.key)) ||
						is_expression_async(property.value)
					);
				}
			});
		}
		case 'RestElement': {
			return is_expression_async(expression.argument);
		}
		case 'SequenceExpression':
		case 'TemplateLiteral': {
			return expression.expressions.some((subexpression) => is_expression_async(subexpression));
		}
		case 'TaggedTemplateExpression': {
			return is_expression_async(expression.tag) || is_expression_async(expression.quasi);
		}
		case 'UnaryExpression':
		case 'UpdateExpression': {
			return is_expression_async(expression.argument);
		}
		case 'YieldExpression': {
			return expression.argument ? is_expression_async(expression.argument) : false;
		}
		default:
			return false;
	}
}

/**
 * @template {import('./types').ClientTransformState} State
 * @param {import('estree').AssignmentExpression} node
 * @param {import('zimmerframe').Context<import('#compiler').SvelteNode, State>} context
 * @param {() => any} fallback
 * @param {{skip_proxy_and_freeze?: boolean}} [options]
 * @returns {import('estree').Expression}
 */
export function serialize_set_binding(node, context, fallback, options) {
	const { state, visit } = context;

	const assignee = node.left;
	if (
		assignee.type === 'ArrayPattern' ||
		assignee.type === 'ObjectPattern' ||
		assignee.type === 'RestElement'
	) {
		// Turn assignment into an IIFE, so that `$.set` calls etc don't produce invalid code
		const tmp_id = context.state.scope.generate('tmp');

		/** @type {import('estree').AssignmentExpression[]} */
		const original_assignments = [];

		/** @type {import('estree').Expression[]} */
		const assignments = [];

		const paths = extract_paths(assignee);

		for (const path of paths) {
			const value = path.expression?.(b.id(tmp_id));
			const assignment = b.assignment('=', path.node, value);
			original_assignments.push(assignment);
			assignments.push(serialize_set_binding(assignment, context, () => assignment, options));
		}

		if (assignments.every((assignment, i) => assignment === original_assignments[i])) {
			// No change to output -> nothing to transform -> we can keep the original assignment
			return fallback();
		}

		const rhs_expression = /** @type {import('estree').Expression} */ (visit(node.right));

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
		error(node, 'INTERNAL', `Unexpected assignment type ${assignee.type}`);
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
									: b.call('$.proxy', value);
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
								: b.call('$.proxy', value)
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
							: b.call('$.proxy', value);
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

	if (binding.mutation !== null) {
		return binding.mutation(node, context);
	}

	if (binding.kind === 'legacy_reactive_import') {
		return b.call(
			'$$_import_' + binding.node.name,
			b.assignment(
				node.operator,
				/** @type {import('estree').Pattern} */ (visit(node.left)),
				/** @type {import('estree').Expression} */ (visit(node.right))
			)
		);
	}

	const is_store = binding.kind === 'store_sub';
	const left_name = is_store ? left.name.slice(1) : left.name;

	if (
		binding.kind !== 'state' &&
		binding.kind !== 'frozen_state' &&
		binding.kind !== 'prop' &&
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
			if (binding.kind === 'prop') {
				return b.call(left, value);
			} else if (is_store) {
				return b.call('$.store_set', serialize_get_binding(b.id(left_name), state), value);
			} else if (binding.kind === 'state') {
				return b.call(
					'$.set',
					b.id(left_name),
					context.state.analysis.runes &&
						!options?.skip_proxy_and_freeze &&
						should_proxy_or_freeze(value, context.state.scope)
						? b.call('$.proxy', value)
						: value
				);
			} else if (binding.kind === 'frozen_state') {
				return b.call(
					'$.set',
					b.id(left_name),
					context.state.analysis.runes &&
						!options?.skip_proxy_and_freeze &&
						should_proxy_or_freeze(value, context.state.scope)
						? b.call('$.freeze', value)
						: value
				);
			} else {
				return b.call('$.set', b.id(left_name), value);
			}
		} else {
			if (is_store) {
				// If we are assigning to a store property, we need to ensure we don't
				// capture the read for the store as part of the member expression to
				// keep consistency with how store $ shorthand reads work in Svelte 4.
				/**
				 *
				 * @param {import("estree").Expression | import("estree").Pattern} node
				 * @returns {import("estree").Expression}
				 */
				function visit_node(node) {
					if (node.type === 'MemberExpression') {
						return {
							...node,
							object: visit_node(/** @type {import("estree").Expression} */ (node.object)),
							property: /** @type {import("estree").MemberExpression} */ (visit(node)).property
						};
					}
					if (node.type === 'Identifier') {
						const binding = state.scope.get(node.name);

						if (binding !== null && binding.kind === 'store_sub') {
							return b.call(
								'$.untrack',
								b.thunk(/** @type {import('estree').Expression} */ (visit(node)))
							);
						}
					}
					return /** @type {import("estree").Expression} */ (visit(node));
				}

				return b.call(
					'$.mutate_store',
					serialize_get_binding(b.id(left_name), state),
					b.assignment(
						node.operator,
						/** @type {import("estree").Pattern}} */ (visit_node(node.left)),
						value
					),
					b.call('$.untrack', b.id('$' + left_name))
				);
			} else if (!state.analysis.runes) {
				if (binding.kind === 'prop') {
					return b.call(
						left,
						b.assignment(
							node.operator,
							/** @type {import('estree').Pattern} */ (visit(node.left)),
							value
						),
						b.literal(true)
					);
				} else {
					return b.call(
						'$.mutate',
						b.id(left_name),
						b.assignment(
							node.operator,
							/** @type {import('estree').Pattern} */ (visit(node.left)),
							value
						)
					);
				}
			} else {
				return b.assignment(
					node.operator,
					/** @type {import('estree').Pattern} */ (visit(node.left)),
					/** @type {import('estree').Expression} */ (visit(node.right))
				);
			}
		}
	};

	if (value.type === 'BinaryExpression' && /** @type {any} */ (value.operator) === '??') {
		return b.logical('??', serialize_get_binding(b.id(left_name), state), serialize());
	}

	return serialize();
}

/**
 * @param {import('estree').ArrowFunctionExpression | import('estree').FunctionExpression} node
 * @param {import('./types').ComponentContext} context
 */
export const function_visitor = (node, context) => {
	const metadata = node.metadata;

	let state = context.state;

	if (node.type === 'FunctionExpression') {
		const parent = /** @type {import('estree').Node} */ (context.path.at(-1));
		const in_constructor = parent.type === 'MethodDefinition' && parent.kind === 'constructor';

		state = { ...context.state, in_constructor };
	} else {
		state = { ...context.state, in_constructor: false };
	}

	if (metadata?.hoistable === true) {
		const params = serialize_hoistable_params(node, context);

		return /** @type {import('estree').FunctionExpression} */ ({
			...node,
			params,
			body: context.visit(node.body, state)
		});
	}

	context.next(state);
};

/**
 * @param {import('estree').FunctionDeclaration | import('estree').FunctionExpression | import('estree').ArrowFunctionExpression} node
 * @param {import('./types').ComponentContext} context
 * @returns {import('estree').Pattern[]}
 */
function get_hoistable_params(node, context) {
	const scope = context.state.scope;

	/** @type {import('estree').Pattern[]} */
	const params = [];
	let added_props = false;

	for (const [reference] of scope.references) {
		const binding = scope.get(reference);

		if (binding !== null && !scope.declarations.has(reference) && binding.initial !== node) {
			if (binding.kind === 'store_sub') {
				// We need both the subscription for getting the value and the store for updating
				params.push(b.id(binding.node.name.slice(1)));
				params.push(b.id(binding.node.name));
			} else if (
				// If it's a destructured derived binding, then we can extract the derived signal reference and use that.
				binding.expression !== null &&
				typeof binding.expression !== 'function' &&
				binding.expression.type === 'MemberExpression' &&
				binding.expression.object.type === 'CallExpression' &&
				binding.expression.object.callee.type === 'Identifier' &&
				binding.expression.object.callee.name === '$.get' &&
				binding.expression.object.arguments[0].type === 'Identifier'
			) {
				params.push(b.id(binding.expression.object.arguments[0].name));
			} else if (
				// If we are referencing a simple $$props value, then we need to reference the object property instead
				binding.kind === 'prop' &&
				!binding.reassigned &&
				binding.initial === null &&
				!context.state.analysis.accessors
			) {
				// Handle $$props.something use-cases
				if (!added_props) {
					added_props = true;
					params.push(b.id('$$props'));
				}
			} else {
				// create a copy to remove start/end tags which would mess up source maps
				params.push(b.id(binding.node.name));
			}
		}
	}
	return params;
}

/**
 * @param {import('estree').FunctionDeclaration | import('estree').FunctionExpression | import('estree').ArrowFunctionExpression} node
 * @param {import('./types').ComponentContext} context
 * @returns {import('estree').Pattern[]}
 */
export function serialize_hoistable_params(node, context) {
	const hoistable_params = get_hoistable_params(node, context);
	node.metadata.hoistable_params = hoistable_params;

	/** @type {import('estree').Pattern[]} */
	const params = [];

	if (node.params.length === 0) {
		if (hoistable_params.length > 0) {
			// For the event object
			params.push(b.id('_'));
		}
	} else {
		for (const param of node.params) {
			params.push(/** @type {import('estree').Pattern} */ (context.visit(param)));
		}
	}

	params.push(...hoistable_params);
	return params;
}

/**
 * @param {import('#compiler').Binding} binding
 * @param {import('./types').ComponentClientTransformState} state
 * @param {string} name
 * @param {import('estree').Expression | null} [initial]
 * @returns
 */
export function get_prop_source(binding, state, name, initial) {
	/** @type {import('estree').Expression[]} */
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
		(state.analysis.immutable ? binding.reassigned : binding.mutated)
	) {
		flags |= PROPS_IS_UPDATED;
	}

	/** @type {import('estree').Expression | undefined} */
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
 * @param {import('estree').Expression} node
 * @param {import("../../scope.js").Scope | null} scope
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
 * @param {import('estree').Identifier} target
 * @param {import('estree').Identifier} source
 */
export function with_loc(target, source) {
	if (source.loc) {
		return { ...target, loc: source.loc };
	}
	return target;
}

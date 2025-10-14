/** @import { ArrowFunctionExpression, CallExpression, Expression, FunctionDeclaration, FunctionExpression, Identifier, VariableDeclarator } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { get_rune } from '../../scope.js';
import * as e from '../../../errors.js';
import { get_parent } from '../../../utils/ast.js';
import { is_pure, is_safe_identifier } from './shared/utils.js';
import { dev, locate_node, source } from '../../../state.js';
import * as b from '#compiler/builders';
import { create_expression_metadata } from '../../nodes.js';

/**
 * @param {CallExpression} node
 * @param {Context} context
 */
export function CallExpression(node, context) {
	const parent = /** @type {AST.SvelteNode} */ (get_parent(context.path, -1));

	const rune = get_rune(node, context.state.scope);

	if (rune && rune !== '$inspect') {
		for (const arg of node.arguments) {
			if (arg.type === 'SpreadElement') {
				e.rune_invalid_spread(node, rune);
			}
		}
	}

	switch (rune) {
		case null:
			if (!is_safe_identifier(node.callee, context.state.scope)) {
				context.state.analysis.needs_context = true;
			}

			break;

		case '$bindable':
			if (node.arguments.length > 1) {
				e.rune_invalid_arguments_length(node, '$bindable', 'zero or one arguments');
			}

			if (
				parent.type !== 'AssignmentPattern' ||
				context.path.at(-3)?.type !== 'ObjectPattern' ||
				context.path.at(-4)?.type !== 'VariableDeclarator' ||
				get_rune(
					/** @type {VariableDeclarator} */ (context.path.at(-4)).init,
					context.state.scope
				) !== '$props'
			) {
				e.bindable_invalid_location(node);
			}

			// We need context in case the bound prop is stale
			context.state.analysis.needs_context = true;

			break;

		case '$host':
			if (node.arguments.length > 0) {
				e.rune_invalid_arguments(node, '$host');
			} else if (context.state.ast_type === 'module' || !context.state.analysis.custom_element) {
				e.host_invalid_placement(node);
			}

			break;

		case '$props':
			if (context.state.has_props_rune) {
				e.props_duplicate(node, rune);
			}

			context.state.has_props_rune = true;

			if (
				parent.type !== 'VariableDeclarator' ||
				context.state.ast_type !== 'instance' ||
				context.state.scope !== context.state.analysis.instance.scope
			) {
				e.props_invalid_placement(node);
			}

			if (node.arguments.length > 0) {
				e.rune_invalid_arguments(node, rune);
			}

			break;

		case '$props.id': {
			const grand_parent = get_parent(context.path, -2);

			if (context.state.analysis.props_id) {
				e.props_duplicate(node, rune);
			}

			if (
				parent.type !== 'VariableDeclarator' ||
				parent.id.type !== 'Identifier' ||
				context.state.ast_type !== 'instance' ||
				context.state.scope !== context.state.analysis.instance.scope ||
				grand_parent.type !== 'VariableDeclaration'
			) {
				e.props_id_invalid_placement(node);
			}

			if (node.arguments.length > 0) {
				e.rune_invalid_arguments(node, rune);
			}

			context.state.analysis.props_id = parent.id;

			break;
		}

		case '$state':
		case '$state.raw':
		case '$derived':
		case '$derived.by': {
			const valid =
				is_variable_declaration(parent, context) ||
				is_class_property_definition(parent) ||
				is_class_property_assignment_at_constructor_root(parent, context);

			if (!valid) {
				e.state_invalid_placement(node, rune);
			}

			if ((rune === '$derived' || rune === '$derived.by') && node.arguments.length !== 1) {
				e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
			} else if (node.arguments.length > 1) {
				e.rune_invalid_arguments_length(node, rune, 'zero or one arguments');
			}

			break;
		}

		case '$effect':
		case '$effect.pre':
			if (parent.type !== 'ExpressionStatement') {
				e.effect_invalid_placement(node);
			}

			if (node.arguments.length !== 1) {
				e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
			}

			// `$effect` needs context because Svelte needs to know whether it should re-run
			// effects that invalidate themselves, and that's determined by whether we're in runes mode
			context.state.analysis.needs_context = true;

			break;

		case '$effect.tracking':
			if (node.arguments.length !== 0) {
				e.rune_invalid_arguments(node, rune);
			}

			break;

		case '$effect.root':
			if (node.arguments.length !== 1) {
				e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
			}

			break;

		case '$effect.pending':
			if (context.state.expression) {
				context.state.expression.has_state = true;
			}

			break;

		case '$inspect':
			if (node.arguments.length < 1) {
				e.rune_invalid_arguments_length(node, rune, 'one or more arguments');
			}

			break;

		case '$inspect().with':
			if (node.arguments.length !== 1) {
				e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
			}

			break;

		case '$inspect.trace': {
			if (node.arguments.length > 1) {
				e.rune_invalid_arguments_length(node, rune, 'zero or one arguments');
			}

			const grand_parent = context.path.at(-2);
			const fn = context.path.at(-3);

			if (
				parent.type !== 'ExpressionStatement' ||
				grand_parent?.type !== 'BlockStatement' ||
				!(
					fn?.type === 'FunctionDeclaration' ||
					fn?.type === 'FunctionExpression' ||
					fn?.type === 'ArrowFunctionExpression'
				) ||
				grand_parent.body[0] !== parent
			) {
				e.inspect_trace_invalid_placement(node);
			}

			if (fn.generator) {
				e.inspect_trace_generator(node);
			}

			if (dev) {
				if (node.arguments[0]) {
					context.state.scope.tracing = b.thunk(/** @type {Expression} */ (node.arguments[0]));
				} else {
					const label = get_function_label(context.path.slice(0, -2)) ?? 'trace';
					const loc = `(${locate_node(fn)})`;

					context.state.scope.tracing = b.thunk(b.literal(label + ' ' + loc));
				}

				context.state.analysis.tracing = true;
			}

			break;
		}

		case '$state.eager':
			if (node.arguments.length !== 1) {
				e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
			}

			break;

		case '$state.snapshot':
			if (node.arguments.length !== 1) {
				e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
			}

			break;
	}

	// `$inspect(foo)` or `$derived(foo) should not trigger the `static-state-reference` warning
	if (rune === '$derived') {
		const expression = create_expression_metadata();

		context.next({
			...context.state,
			function_depth: context.state.function_depth + 1,
			in_derived: true,
			expression
		});

		if (expression.has_await) {
			context.state.analysis.async_deriveds.add(node);
		}
	} else if (rune === '$inspect') {
		context.next({ ...context.state, function_depth: context.state.function_depth + 1 });
	} else {
		context.next();
	}

	if (context.state.expression) {
		// TODO We assume that any dependencies are stateful, which isn't necessarily the case — see
		// https://github.com/sveltejs/svelte/issues/13266. This check also includes dependencies
		// outside the call expression itself (e.g. `{blah && pure()}`) resulting in additional
		// false positives, but for now we accept that trade-off
		if (!is_pure(node.callee, context) || context.state.expression.dependencies.size > 0) {
			context.state.expression.has_call = true;
			context.state.expression.has_state = true;
		}
	}
}

/**
 * @param {AST.SvelteNode[]} nodes
 */
function get_function_label(nodes) {
	const fn = /** @type {FunctionExpression | FunctionDeclaration | ArrowFunctionExpression} */ (
		nodes.at(-1)
	);

	if ((fn.type === 'FunctionDeclaration' || fn.type === 'FunctionExpression') && fn.id != null) {
		return fn.id.name;
	}

	const parent = nodes.at(-2);
	if (!parent) return;

	if (parent.type === 'CallExpression') {
		return source.slice(parent.callee.start, parent.callee.end) + '(...)';
	}

	if (parent.type === 'Property' && !parent.computed) {
		return /** @type {Identifier} */ (parent.key).name;
	}

	if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
		return parent.id.name;
	}
}

/**
 * @param {AST.SvelteNode} parent
 * @param {Context} context
 */
function is_variable_declaration(parent, context) {
	return parent.type === 'VariableDeclarator' && get_parent(context.path, -3).type !== 'ConstTag';
}

/**
 * @param {AST.SvelteNode} parent
 */
function is_class_property_definition(parent) {
	return parent.type === 'PropertyDefinition' && !parent.static && !parent.computed;
}

/**
 * @param {AST.SvelteNode} node
 * @param {Context} context
 */
function is_class_property_assignment_at_constructor_root(node, context) {
	if (
		node.type === 'AssignmentExpression' &&
		node.operator === '=' &&
		node.left.type === 'MemberExpression' &&
		node.left.object.type === 'ThisExpression' &&
		((node.left.property.type === 'Identifier' && !node.left.computed) ||
			node.left.property.type === 'PrivateIdentifier' ||
			node.left.property.type === 'Literal')
	) {
		// MethodDefinition (-5) -> FunctionExpression (-4) -> BlockStatement (-3) -> ExpressionStatement (-2) -> AssignmentExpression (-1)
		const parent = get_parent(context.path, -5);
		return parent?.type === 'MethodDefinition' && parent.kind === 'constructor';
	}

	return false;
}

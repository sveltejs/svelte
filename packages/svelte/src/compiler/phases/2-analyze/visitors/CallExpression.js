/** @import { ArrowFunctionExpression, CallExpression, Expression, FunctionDeclaration, FunctionExpression, Identifier, MemberExpression, VariableDeclarator } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { get_rune } from '../../scope.js';
import * as e from '../../../errors.js';
import { get_parent, object, unwrap_optional } from '../../../utils/ast.js';
import { is_pure, is_safe_identifier } from './shared/utils.js';
import { dev, locate_node, source } from '../../../state.js';
import * as b from '../../../utils/builders.js';

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
		/* eslint-disable no-fallthrough */
		case '$state.invalidate':
			if (node.arguments.length !== 1) {
				e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
			} else {
				let arg = node.arguments[0];
				if (arg.type !== 'Identifier' && arg.type !== 'MemberExpression') {
					e.state_invalidate_nonreactive_argument(node);
				}
				if (arg.type === 'MemberExpression') {
					if (arg.object.type !== 'ThisExpression') {
						const obj = object((arg = /** @type {MemberExpression} */ (context.visit(arg))));
						if (obj?.type === 'Identifier') {
							// there isn't really a good way to tell because of stuff like `notproxied = proxied`
							break;
						} else if (obj?.type !== 'ThisExpression') {
							e.state_invalidate_nonreactive_argument(node);
						}
					} else if (arg.computed) {
						e.state_invalidate_invalid_this_property(node);
					}
					const class_body = context.path.findLast((parent) => parent.type === 'ClassBody');
					if (!class_body) {
						e.state_invalidate_invalid_this_property(node);
					}
					const possible_this_bindings = context.path.filter((parent, index) => {
						return (
							parent.type === 'FunctionDeclaration' ||
							(parent.type === 'FunctionExpression' &&
								context.path[index - 1]?.type !== 'MethodDefinition')
						);
					});
					if (possible_this_bindings.length === 0) {
						break;
					}
					const class_index = context.path.indexOf(class_body);
					const last_possible_this_index = context.path.indexOf(
						/** @type {AST.SvelteNode} */ (possible_this_bindings.at(-1))
					);
					if (class_index < last_possible_this_index) {
						e.state_invalidate_invalid_this_property(node);
					}
					// we can't really do anything else yet, so we just wait for the transformation phase
					// where we know which class fields are reactive (and what their private aliases are)
					break;
				} else {
					let binding = context.state.scope.get(arg.name);
					if (binding) {
						if (binding.kind === 'raw_state' || binding.kind === 'state') {
							binding.reassigned = true;
							break;
						}
					}
				}
				e.state_invalidate_nonreactive_argument(node);
			}

		case '$state':
		case '$state.raw':
		case '$derived':
		case '$derived.by':
			if (
				(parent.type !== 'VariableDeclarator' ||
					get_parent(context.path, -3).type === 'ConstTag') &&
				!(parent.type === 'PropertyDefinition' && !parent.static && !parent.computed)
			) {
				e.state_invalid_placement(node, rune);
			}

			if ((rune === '$derived' || rune === '$derived.by') && node.arguments.length !== 1) {
				e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
			} else if (node.arguments.length > 1) {
				e.rune_invalid_arguments_length(node, rune, 'zero or one arguments');
			}

			break;

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

		case '$state.snapshot':
			if (node.arguments.length !== 1) {
				e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
			}

			break;
	}

	// `$inspect(foo)` or `$derived(foo) should not trigger the `static-state-reference` warning
	if (rune === '$inspect' || rune === '$derived') {
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

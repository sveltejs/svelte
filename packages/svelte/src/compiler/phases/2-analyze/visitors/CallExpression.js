/** @import { CallExpression, VariableDeclarator } from 'estree' */
/** @import { AST, SvelteNode } from '#compiler' */
/** @import { Context } from '../types' */
import { get_rune } from '../../scope.js';
import * as e from '../../../errors.js';
import { get_parent, unwrap_optional } from '../../../utils/ast.js';
import { is_pure, is_safe_identifier } from './shared/utils.js';

/**
 * @param {CallExpression} node
 * @param {Context} context
 */
export function CallExpression(node, context) {
	const parent = /** @type {SvelteNode} */ (get_parent(context.path, -1));

	const rune = get_rune(node, context.state.scope);

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
				e.props_duplicate(node);
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

		case '$state':
		case '$state.raw':
		case '$derived':
		case '$derived.by':
			if (
				parent.type !== 'VariableDeclarator' &&
				!(parent.type === 'PropertyDefinition' && !parent.static && !parent.computed)
			) {
				e.state_invalid_placement(node, rune);
			}

			if ((rune === '$derived' || rune === '$derived.by') && node.arguments.length !== 1) {
				e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
			} else if (rune === '$state' && node.arguments.length > 1) {
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

		case '$state.snapshot':
			if (node.arguments.length !== 1) {
				e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
			}

			break;
	}

	if (context.state.expression && !is_pure(node.callee, context)) {
		context.state.expression.has_call = true;
		context.state.expression.has_state = true;
	}

	if (context.state.render_tag) {
		// Find out which of the render tag arguments contains this call expression
		const arg_idx = unwrap_optional(context.state.render_tag.expression).arguments.findIndex(
			(arg) => arg === node || context.path.includes(arg)
		);

		// -1 if this is the call expression of the render tag itself
		if (arg_idx !== -1) {
			context.state.render_tag.metadata.args_with_call_expression.add(arg_idx);
		}
	}

	if (node.callee.type === 'Identifier') {
		const binding = context.state.scope.get(node.callee.name);

		if (binding !== null) {
			binding.is_called = true;
		}
	}

	// `$inspect(foo)` or `$derived(foo) should not trigger the `static-state-reference` warning
	if (rune === '$inspect' || rune === '$derived') {
		context.next({ ...context.state, function_depth: context.state.function_depth + 1 });
	} else {
		context.next();
	}
}

/** @import { CallExpression } from 'estree' */
/** @import { SvelteNode } from '#compiler' */
/** @import { Scope } from '../../scope' */
/** @import { Context } from '../types' */
import { get_rune } from '../../scope.js';
import * as e from '../../../errors.js';
import { get_parent } from '../../../utils/ast.js';

/**
 * @param {CallExpression} node
 * @param {Context} context
 */
export function CallExpression(node, context) {
	const rune = get_rune(node, context.state.scope);

	if (rune === '$bindable' && node.arguments.length > 1) {
		e.rune_invalid_arguments_length(node, '$bindable', 'zero or one arguments');
	} else if (rune === '$host') {
		if (node.arguments.length > 0) {
			e.rune_invalid_arguments(node, '$host');
		} else if (context.state.ast_type === 'module' || !context.state.analysis.custom_element) {
			e.host_invalid_placement(node);
		}
	}

	validate_call_expression(node, context.state.scope, context.path);

	context.next();
}

/**
 * @param {CallExpression} node
 * @param {Scope} scope
 * @param {SvelteNode[]} path
 * @returns
 */
function validate_call_expression(node, scope, path) {
	const rune = get_rune(node, scope);
	if (rune === null) return;

	const parent = /** @type {SvelteNode} */ (get_parent(path, -1));

	if (rune === '$props') {
		if (parent.type === 'VariableDeclarator') return;
		e.props_invalid_placement(node);
	}

	if (rune === '$bindable') {
		if (parent.type === 'AssignmentPattern' && path.at(-3)?.type === 'ObjectPattern') {
			const declarator = path.at(-4);
			if (
				declarator?.type === 'VariableDeclarator' &&
				get_rune(declarator.init, scope) === '$props'
			) {
				return;
			}
		}
		e.bindable_invalid_location(node);
	}

	if (
		rune === '$state' ||
		rune === '$state.frozen' ||
		rune === '$derived' ||
		rune === '$derived.by'
	) {
		if (parent.type === 'VariableDeclarator') return;
		if (parent.type === 'PropertyDefinition' && !parent.static && !parent.computed) return;
		e.state_invalid_placement(node, rune);
	}

	if (rune === '$effect' || rune === '$effect.pre') {
		if (parent.type !== 'ExpressionStatement') {
			e.effect_invalid_placement(node);
		}

		if (node.arguments.length !== 1) {
			e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
		}
	}

	if (rune === '$effect.tracking') {
		if (node.arguments.length !== 0) {
			e.rune_invalid_arguments(node, rune);
		}
	}

	if (rune === '$effect.root') {
		if (node.arguments.length !== 1) {
			e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
		}
	}

	if (rune === '$inspect') {
		if (node.arguments.length < 1) {
			e.rune_invalid_arguments_length(node, rune, 'one or more arguments');
		}
	}

	if (rune === '$inspect().with') {
		if (node.arguments.length !== 1) {
			e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
		}
	}

	if (rune === '$state.snapshot') {
		if (node.arguments.length !== 1) {
			e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
		}
	}

	if (rune === '$state.is') {
		if (node.arguments.length !== 2) {
			e.rune_invalid_arguments_length(node, rune, 'exactly two arguments');
		}
	}
}

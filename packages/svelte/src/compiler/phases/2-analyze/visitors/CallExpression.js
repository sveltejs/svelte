/** @import { CallExpression } from 'estree' */
/** @import { SvelteNode } from '#compiler' */
/** @import { Context } from '../types' */
import { get_rune } from '../../scope.js';
import * as e from '../../../errors.js';
import { get_parent } from '../../../utils/ast.js';

/**
 * @param {CallExpression} node
 * @param {Context} context
 */
export function CallExpression(node, context) {
	const parent = /** @type {SvelteNode} */ (get_parent(context.path, -1));

	const rune = get_rune(node, context.state.scope);

	switch (rune) {
		case null:
			break;

		case '$bindable':
			if (node.arguments.length > 1) {
				e.rune_invalid_arguments_length(node, '$bindable', 'zero or one arguments');
			}

			if (parent.type !== 'AssignmentPattern' || context.path.at(-3)?.type !== 'ObjectPattern') {
				e.bindable_invalid_location(node);
			}

			const declarator = context.path.at(-4);
			if (
				declarator?.type !== 'VariableDeclarator' ||
				get_rune(declarator.init, context.state.scope) !== '$props'
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
			if (parent.type !== 'VariableDeclarator') {
				e.props_invalid_placement(node);
			}
			break;

		case '$state':
		case '$state.frozen':
		case '$derived':
		case '$derived.by':
			if (
				parent.type !== 'VariableDeclarator' &&
				!(parent.type === 'PropertyDefinition' && !parent.static && !parent.computed)
			) {
				e.state_invalid_placement(node, rune);
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

		case '$state.is':
			if (node.arguments.length !== 2) {
				e.rune_invalid_arguments_length(node, rune, 'exactly two arguments');
			}
			break;
	}

	context.next();
}

/** @import { VariableDeclarator } from 'estree' */
/** @import { Context } from '../types' */
import { get_rune } from '../../scope.js';
import { ensure_no_module_import_conflict } from './shared/utils.js';
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';

/**
 * @param {VariableDeclarator} node
 * @param {Context} context
 */
export function VariableDeclarator(node, context) {
	ensure_no_module_import_conflict(node, context.state);

	if (context.state.analysis.runes) {
		const init = node.init;
		const rune = get_rune(init, context.state.scope);

		if (rune === null) return;

		const args = /** @type {import('estree').CallExpression} */ (init).arguments;

		// TODO some of this is duplicated with above, seems off
		if ((rune === '$derived' || rune === '$derived.by') && args.length !== 1) {
			e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
		} else if (rune === '$state' && args.length > 1) {
			e.rune_invalid_arguments_length(node, rune, 'zero or one arguments');
		} else if (rune === '$props') {
			if (context.state.has_props_rune) {
				e.props_duplicate(node);
			}

			context.state.has_props_rune = true;

			if (args.length > 0) {
				e.rune_invalid_arguments(node, rune);
			}

			if (node.id.type !== 'ObjectPattern' && node.id.type !== 'Identifier') {
				e.props_invalid_identifier(node);
			}

			if (node.id.type === 'ObjectPattern') {
				for (const property of node.id.properties) {
					if (property.type === 'Property') {
						if (property.computed) {
							e.props_invalid_pattern(property);
						}

						if (property.key.type === 'Identifier' && property.key.name.startsWith('$$')) {
							e.props_illegal_name(property);
						}

						const value =
							property.value.type === 'AssignmentPattern' ? property.value.left : property.value;

						if (value.type !== 'Identifier') {
							e.props_invalid_pattern(property);
						}
					}
				}
			}
		}

		if (rune === '$derived') {
			const arg = args[0];
			if (
				arg.type === 'CallExpression' &&
				(arg.callee.type === 'ArrowFunctionExpression' || arg.callee.type === 'FunctionExpression')
			) {
				w.derived_iife(node);
			}
		}
	} else {
		if (node.init?.type === 'CallExpression') {
			const callee = node.init.callee;
			if (
				callee.type === 'Identifier' &&
				(callee.name === '$state' || callee.name === '$derived' || callee.name === '$props') &&
				context.state.scope.get(callee.name)?.kind !== 'store_sub'
			) {
				e.rune_invalid_usage(node.init, callee.name);
			}
		}
	}

	context.next();
}

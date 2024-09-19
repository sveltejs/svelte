/** @import { Expression, Identifier, Literal, VariableDeclarator } from 'estree' */
/** @import { Binding } from '#compiler' */
/** @import { Context } from '../types' */
import { get_rune } from '../../scope.js';
import { ensure_no_module_import_conflict, validate_identifier_name } from './shared/utils.js';
import * as e from '../../../errors.js';
import { extract_paths } from '../../../utils/ast.js';
import { equal } from '../../../utils/assert.js';

/**
 * @param {VariableDeclarator} node
 * @param {Context} context
 */
export function VariableDeclarator(node, context) {
	ensure_no_module_import_conflict(node, context.state);

	if (context.state.analysis.runes) {
		const init = node.init;
		const rune = get_rune(init, context.state.scope);
		const paths = extract_paths(node.id);

		for (const path of paths) {
			validate_identifier_name(context.state.scope.get(/** @type {Identifier} */ (path.node).name));
		}

		// TODO feels like this should happen during scope creation?
		if (
			rune === '$state' ||
			rune === '$state.raw' ||
			rune === '$derived' ||
			rune === '$derived.by' ||
			rune === '$props'
		) {
			for (const path of paths) {
				// @ts-ignore this fails in CI for some insane reason
				const binding = /** @type {Binding} */ (context.state.scope.get(path.node.name));
				binding.kind =
					rune === '$state'
						? 'state'
						: rune === '$state.raw'
							? 'raw_state'
							: rune === '$derived' || rune === '$derived.by'
								? 'derived'
								: path.is_rest
									? 'rest_prop'
									: 'prop';
			}
		}

		if (rune === '$props') {
			if (node.id.type !== 'ObjectPattern' && node.id.type !== 'Identifier') {
				e.props_invalid_identifier(node);
			}

			context.state.analysis.needs_props = true;

			if (node.id.type === 'Identifier') {
				const binding = /** @type {Binding} */ (context.state.scope.get(node.id.name));
				binding.initial = null; // else would be $props()
				binding.kind = 'rest_prop';
			} else {
				equal(node.id.type, 'ObjectPattern');

				for (const property of node.id.properties) {
					if (property.type !== 'Property') continue;

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

					const alias =
						property.key.type === 'Identifier'
							? property.key.name
							: String(/** @type {Literal} */ (property.key).value);

					let initial = property.value.type === 'AssignmentPattern' ? property.value.right : null;

					const binding = /** @type {Binding} */ (context.state.scope.get(value.name));
					binding.prop_alias = alias;

					// rewire initial from $props() to the actual initial value, stripping $bindable() if necessary
					if (
						initial?.type === 'CallExpression' &&
						initial.callee.type === 'Identifier' &&
						initial.callee.name === '$bindable'
					) {
						binding.initial = /** @type {Expression | null} */ (initial.arguments[0] ?? null);
						binding.kind = 'bindable_prop';
					} else {
						binding.initial = initial;
					}
				}
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

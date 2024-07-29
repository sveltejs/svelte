/** @import { VariableDeclarator } from 'estree' */
/** @import { Context } from '../types' */
import { get_rune } from '../../scope.js';
import { ensure_no_module_import_conflict } from './shared/utils.js';
import * as e from '../../../errors.js';
import { extract_paths } from '../../../utils/ast.js';

/**
 * @param {VariableDeclarator} node
 * @param {Context} context
 */
export function VariableDeclarator(node, context) {
	ensure_no_module_import_conflict(node, context.state);

	if (context.state.analysis.runes) {
		const init = node.init;
		const rune = get_rune(init, context.state.scope);

		if (rune === '$props') {
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

		// TODO feels like this should happen during scope creation?
		if (
			rune === '$state' ||
			rune === '$state.frozen' ||
			rune === '$derived' ||
			rune === '$derived.by'
		) {
			for (const path of extract_paths(node.id)) {
				// @ts-ignore this fails in CI for some insane reason
				const binding = /** @type {Binding} */ (context.state.scope.get(path.node.name));
				binding.kind =
					rune === '$state' ? 'state' : rune === '$state.frozen' ? 'frozen_state' : 'derived';
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

/** @import { VariableDeclarator } from 'estree' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import { ensure_no_module_import_conflict } from './shared/utils.js';

/**
 * @param {VariableDeclarator} node
 * @param {Context} context
 */
export function VariableDeclarator(node, context) {
	ensure_no_module_import_conflict(node, context.state);

	if (!context.state.analysis.runes) {
		if (node.init?.type !== 'CallExpression') return;

		const callee = node.init.callee;
		if (
			callee.type !== 'Identifier' ||
			(callee.name !== '$state' && callee.name !== '$derived' && callee.name !== '$props')
		) {
			return;
		}

		if (context.state.scope.get(callee.name)?.kind !== 'store_sub') {
			e.rune_invalid_usage(node.init, callee.name);
		}
	}

	context.next();
}

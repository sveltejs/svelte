/** @import { ExportSpecifier } from 'estree' */
/** @import { Context } from '../types' */
import { validate_export } from './shared/utils.js';

/**
 * @param {ExportSpecifier} node
 * @param {Context} context
 */
export function ExportSpecifier(node, context) {
	const local_name =
		node.local.type === 'Identifier' ? node.local.name : /** @type {string} */ (node.local.value);
	const exported_name =
		node.exported.type === 'Identifier'
			? node.exported.name
			: /** @type {string} */ (node.exported.value);

	if (context.state.ast_type === 'instance') {
		if (context.state.analysis.runes) {
			context.state.analysis.exports.push({
				name: local_name,
				alias: exported_name
			});

			const binding = context.state.scope.get(local_name);
			if (binding) binding.reassigned = true;
		}
	} else {
		validate_export(node, context.state.scope, local_name);
	}
}

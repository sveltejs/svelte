/** @import { ExportSpecifier, Node } from 'estree' */
/** @import { Binding } from '#compiler' */
/** @import { Context } from '../types' */
/** @import { Scope } from '../../scope' */
import * as e from '../../../errors.js';

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
			if (binding) binding.reassigned = binding.updated = true;
		}
	} else {
		validate_export(node, context.state.scope, local_name);
	}
}

/**
 *
 * @param {Node} node
 * @param {Scope} scope
 * @param {string} name
 */
function validate_export(node, scope, name) {
	const binding = scope.get(name);
	if (!binding) return;

	if (binding.kind === 'derived') {
		e.derived_invalid_export(node);
	}

	if ((binding.kind === 'state' || binding.kind === 'raw_state') && binding.reassigned) {
		e.state_invalid_export(node);
	}
}

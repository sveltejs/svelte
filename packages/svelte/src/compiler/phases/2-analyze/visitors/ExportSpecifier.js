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
	if (context.state.ast_type === 'instance') {
		if (context.state.analysis.runes) {
			context.state.analysis.exports.push({
				name: node.local.name,
				alias: node.exported.name
			});

			const binding = context.state.scope.get(node.local.name);
			if (binding) binding.reassigned = binding.updated = true;
		}
	} else {
		validate_export(node, context.state.scope, node.local.name);
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

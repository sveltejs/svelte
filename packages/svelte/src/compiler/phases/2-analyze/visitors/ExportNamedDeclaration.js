/** @import { ExportNamedDeclaration, Node } from 'estree' */
/** @import { Context } from '../types' */
/** @import { Scope } from '../../scope' */
import * as e from '../../../errors.js';
import { extract_identifiers } from '../../../utils/ast.js';

/**
 * @param {ExportNamedDeclaration} node
 * @param {Context} context
 */
export function ExportNamedDeclaration(node, context) {
	// visit children, so bindings are correctly initialised
	context.next();

	if (node.declaration?.type === 'VariableDeclaration') {
		// in runes mode, forbid `export let`
		if (
			context.state.analysis.runes &&
			context.state.ast_type === 'instance' &&
			node.declaration.kind === 'let'
		) {
			e.legacy_export_invalid(node);
		}

		for (const declarator of node.declaration.declarations) {
			for (const id of extract_identifiers(declarator.id)) {
				validate_export(node, context.state.scope, id.name);
			}
		}
	}

	if (node.specifiers && context.state.ast_type !== 'instance') {
		for (const specifier of node.specifiers) {
			validate_export(specifier, context.state.scope, specifier.local.name);
		}
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

	if ((binding.kind === 'state' || binding.kind === 'frozen_state') && binding.reassigned) {
		e.state_invalid_export(node);
	}
}

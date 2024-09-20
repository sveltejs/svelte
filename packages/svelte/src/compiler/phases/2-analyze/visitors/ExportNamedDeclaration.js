/** @import { ExportNamedDeclaration, Identifier, Node } from 'estree' */
/** @import { Binding } from '#compiler' */
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
				const binding = context.state.scope.get(id.name);
				if (!binding) continue;

				if (binding.kind === 'derived') {
					e.derived_invalid_export(node);
				}

				if ((binding.kind === 'state' || binding.kind === 'raw_state') && binding.reassigned) {
					e.state_invalid_export(node);
				}
			}
		}
	}

	if (context.state.analysis.runes) {
		if (node.declaration && context.state.ast_type === 'instance') {
			if (
				node.declaration.type === 'FunctionDeclaration' ||
				node.declaration.type === 'ClassDeclaration'
			) {
				context.state.analysis.exports.push({
					name: /** @type {Identifier} */ (node.declaration.id).name,
					alias: null
				});
			} else if (node.declaration.kind === 'const') {
				for (const declarator of node.declaration.declarations) {
					for (const node of extract_identifiers(declarator.id)) {
						context.state.analysis.exports.push({ name: node.name, alias: null });
					}
				}
			}
		}
	}
}

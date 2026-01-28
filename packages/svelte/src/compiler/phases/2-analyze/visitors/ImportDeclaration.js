/** @import { ImportDeclaration } from 'estree' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {ImportDeclaration} node
 * @param {Context} context
 */
export function ImportDeclaration(node, context) {
	if (context.state.analysis.runes) {
		const source = /** @type {string} */ (node.source.value);

		if (source.startsWith('svelte/internal')) {
			e.import_svelte_internal_forbidden(node);
		}

		if (source === 'svelte') {
			for (const specifier of node.specifiers) {
				if (specifier.type === 'ImportSpecifier') {
					if (
						specifier.imported.type === 'Identifier' &&
						(specifier.imported.name === 'beforeUpdate' ||
							specifier.imported.name === 'afterUpdate')
					) {
						e.runes_mode_invalid_import(specifier, specifier.imported.name);
					}
				}
			}
		}
	}
}

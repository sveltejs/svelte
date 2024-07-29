/** @import { ImportDeclaration } from 'estree' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {ImportDeclaration} node
 * @param {Context} context
 */
export function ImportDeclaration(node, context) {
	if (
		context.state.analysis.runes &&
		/** @type {string} */ (node.source.value).startsWith('svelte/internal')
	) {
		e.import_svelte_internal_forbidden(node);
	}
}

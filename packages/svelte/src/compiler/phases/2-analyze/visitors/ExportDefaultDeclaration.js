/** @import { ExportDefaultDeclaration } from 'estree' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import { validate_export } from './shared/utils.js';

/**
 * @param {ExportDefaultDeclaration} node
 * @param {Context} context
 */
export function ExportDefaultDeclaration(node, context) {
	if (!context.state.ast_type /* .svelte.js module */) {
		if (node.declaration.type === 'Identifier') {
			validate_export(node, context.state.scope, node.declaration.name);
		}
	} else {
		e.module_illegal_default_export(node);
	}

	context.next();
}

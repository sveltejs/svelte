/** @import { ExportDefaultDeclaration, Node } from 'estree' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {ExportDefaultDeclaration} node
 * @param {Context} context
 */
export function ExportDefaultDeclaration(node, context) {
	if (context.state.ast_type === 'instance') {
		e.module_illegal_default_export(node);
	}

	context.next();
}

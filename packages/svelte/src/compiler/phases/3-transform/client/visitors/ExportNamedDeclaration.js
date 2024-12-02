/** @import { ExportNamedDeclaration } from 'estree' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {ExportNamedDeclaration} node
 * @param {ComponentContext} context
 */
export function ExportNamedDeclaration(node, context) {
	if (context.state.is_instance) {
		if (node.declaration) {
			return context.visit(node.declaration);
		}

		return b.empty;
	}

	return context.next();
}

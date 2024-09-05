/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as w from '../../../warnings.js';

/**
 * @param {AST.ClassDirective} node
 * @param {Context} context
 */
export function ClassDirective(node, context) {
	if (node.expression.type === 'Identifier' && !context.state.scope.get(node.expression.name)) {
		w.directive_not_defined(node, node.expression.name);
	}
	context.next({ ...context.state, expression: node.metadata.expression });
}

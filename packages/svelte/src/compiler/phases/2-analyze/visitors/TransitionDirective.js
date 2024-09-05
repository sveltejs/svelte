/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as w from '../../../warnings.js';

/**
 * @param {AST.TransitionDirective} node
 * @param {Context} context
 */
export function TransitionDirective(node, context) {
	if (!context.state.scope.get(node.name)) {
		w.directive_not_defined(node, node.name);
	}
}

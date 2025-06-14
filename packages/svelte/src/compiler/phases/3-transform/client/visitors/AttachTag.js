/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { build_expression } from './shared/utils.js';

/**
 * @param {AST.AttachTag} node
 * @param {ComponentContext} context
 */
export function AttachTag(node, context) {
	const expression = build_expression(context, node.expression, node.metadata.expression);
	context.state.init.push(b.stmt(b.call('$.attach', context.state.node, b.thunk(expression))));
	context.next();
}

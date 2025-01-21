/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {AST.Attachment} node
 * @param {ComponentContext} context
 */
export function Attachment(node, context) {
	for (const attachment of node.attachments) {
		if (attachment.type === 'SpreadElement') {
			context.state.init.push(
				b.stmt(
					b.call(
						'$.attach_all',
						context.state.node,
						b.thunk(/** @type {Expression} */ (context.visit(attachment.argument)))
					)
				)
			);
		} else {
			context.state.init.push(
				b.stmt(
					b.call(
						'$.attach',
						context.state.node,
						b.thunk(/** @type {Expression} */ (context.visit(attachment)))
					)
				)
			);
		}
	}
}

/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {AST.DebugTag} node
 * @param {ComponentContext} context
 */
export function DebugTag(node, context) {
	context.state.template.push(
		b.stmt(
			b.call(
				'console.log',
				b.object(
					node.identifiers.map((identifier) =>
						b.prop('init', identifier, /** @type {Expression} */ (context.visit(identifier)))
					)
				)
			)
		),
		b.debugger
	);
}

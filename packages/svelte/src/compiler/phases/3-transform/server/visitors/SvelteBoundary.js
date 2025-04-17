/** @import { BlockStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { BLOCK_CLOSE, BLOCK_OPEN } from '../../../../../internal/server/hydration.js';
import * as b from '#compiler/builders';

/**
 * @param {AST.SvelteBoundary} node
 * @param {ComponentContext} context
 */
export function SvelteBoundary(node, context) {
	context.state.template.push(
		b.literal(BLOCK_OPEN),
		/** @type {BlockStatement} */ (context.visit(node.fragment)),
		b.literal(BLOCK_CLOSE)
	);
}

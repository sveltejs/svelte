/** @import { BlockStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import { hash } from '../../../../../utils.js';
import { filename } from '../../../../state.js';

/**
 * @param {AST.SvelteHead} node
 * @param {ComponentContext} context
 */
export function SvelteHead(node, context) {
	// TODO attributes?
	context.state.init.push(
		b.stmt(
			b.call(
				'$.head',
				b.literal(hash(filename)),
				b.arrow([b.id('$$anchor')], /** @type {BlockStatement} */ (context.visit(node.fragment)))
			)
		)
	);
}

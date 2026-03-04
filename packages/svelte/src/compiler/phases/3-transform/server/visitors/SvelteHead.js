/** @import { BlockStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { hash } from '../../../../../utils.js';
import { filename } from '../../../../state.js';

/**
 * @param {AST.SvelteHead} node
 * @param {ComponentContext} context
 */
export function SvelteHead(node, context) {
	const block = /** @type {BlockStatement} */ (context.visit(node.fragment));

	context.state.template.push(
		b.stmt(
			b.call(
				'$.head',
				b.literal(hash(filename)),
				b.id('$$renderer'),
				b.arrow([b.id('$$renderer')], block)
			)
		)
	);
}

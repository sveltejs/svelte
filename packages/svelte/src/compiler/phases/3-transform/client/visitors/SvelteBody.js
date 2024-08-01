/** @import { SvelteBody } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {SvelteBody} node
 * @param {ComponentContext} context
 */
export function SvelteBody(node, context) {
	context.next({
		...context.state,
		node: b.id('$.document.body')
	});
}

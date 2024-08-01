/** @import { SvelteDocument } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {SvelteDocument} node
 * @param {ComponentContext} context
 */
export function SvelteDocument(node, context) {
	context.next({
		...context.state,
		node: b.id('$.document')
	});
}

/** @import { SvelteWindow } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {SvelteWindow} node
 * @param {ComponentContext} context
 */
export function SvelteWindow(node, context) {
	context.next({
		...context.state,
		node: b.id('$.window')
	});
}

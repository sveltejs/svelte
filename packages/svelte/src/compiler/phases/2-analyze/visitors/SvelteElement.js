/** @import { SvelteElement } from '#compiler' */
/** @import { Context } from '../types' */
import { validate_element } from './shared/element.js';

/**
 * @param {SvelteElement} node
 * @param {Context} context
 */
export function SvelteElement(node, context) {
	validate_element(node, context);

	context.next({
		...context.state,
		parent_element: null
	});
}

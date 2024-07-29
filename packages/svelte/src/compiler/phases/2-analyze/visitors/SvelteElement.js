/** @import { SvelteElement } from '#compiler' */
/** @import { Context } from '../types' */
import { check_element } from './shared/a11y.js';
import { validate_element } from './shared/element.js';

/**
 * @param {SvelteElement} node
 * @param {Context} context
 */
export function SvelteElement(node, context) {
	validate_element(node, context);

	check_element(node, context.state);

	context.next({
		...context.state,
		parent_element: null
	});
}

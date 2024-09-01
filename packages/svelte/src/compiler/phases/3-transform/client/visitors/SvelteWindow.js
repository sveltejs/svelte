/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { visit_special_element } from './shared/special_element.js';

/**
 * @param {AST.SvelteWindow} node
 * @param {ComponentContext} context
 */
export function SvelteWindow(node, context) {
	visit_special_element(node, '$.window', context);
}

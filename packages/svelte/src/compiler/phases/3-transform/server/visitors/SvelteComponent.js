/** @import { Expression } from 'estree' */
/** @import { SvelteComponent } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { serialize_inline_component } from './shared/component.js';

/**
 * @param {SvelteComponent} node
 * @param {ComponentContext} context
 */
export function SvelteComponent(node, context) {
	serialize_inline_component(
		node,
		/** @type {Expression} */ (context.visit(node.expression)),
		context
	);
}

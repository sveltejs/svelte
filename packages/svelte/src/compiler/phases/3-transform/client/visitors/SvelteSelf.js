/** @import { SvelteSelf } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { build_component } from './shared/component.js';

/**
 * @param {SvelteSelf} node
 * @param {ComponentContext} context
 */
export function SvelteSelf(node, context) {
	const component = build_component(node, context.state.analysis.name, context);
	context.state.init.push(component);
}

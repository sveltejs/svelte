/** @import { SvelteSelf } from '#compiler' */
/** @import { Context } from '../types' */
import { validate_component } from './shared/component.js';

/**
 * @param {SvelteSelf} node
 * @param {Context} context
 */
export function SvelteSelf(node, context) {
	validate_component(node, context);
}

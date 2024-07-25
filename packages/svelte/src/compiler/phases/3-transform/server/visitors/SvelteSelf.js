/** @import { SvelteSelf } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '../../../../utils/builders.js';
import { serialize_inline_component } from './shared/component.js';

/**
 * @param {SvelteSelf} node
 * @param {ComponentContext} context
 */
export function SvelteSelf(node, context) {
	serialize_inline_component(node, b.id(context.state.analysis.name), context);
}

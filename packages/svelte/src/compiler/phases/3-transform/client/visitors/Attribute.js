/** @import { Attribute } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { is_event_attribute } from '../../../../utils/ast.js';
import { build_event_attribute } from './shared/element.js';

/**
 * @param {Attribute} node
 * @param {ComponentContext} context
 */
export function Attribute(node, context) {
	if (is_event_attribute(node)) {
		build_event_attribute(node, context);
	}
}

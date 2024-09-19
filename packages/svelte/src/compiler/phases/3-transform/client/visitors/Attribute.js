/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { is_event_attribute } from '../../../../utils/ast.js';
import { visit_event_attribute } from './shared/events.js';

/**
 * @param {AST.Attribute} node
 * @param {ComponentContext} context
 */
export function Attribute(node, context) {
	if (is_event_attribute(node)) {
		visit_event_attribute(node, context);
	}
}

/** @import { SlotElement } from '#compiler' */
/** @import { Context } from '../types' */
import { is_text_attribute } from '../../../utils/ast.js';
import * as e from '../../../errors.js';

/**
 * @param {SlotElement} node
 * @param {Context} context
 */
export function SlotElement(node, context) {
	for (const attribute of node.attributes) {
		if (attribute.type === 'Attribute') {
			if (attribute.name === 'name') {
				if (!is_text_attribute(attribute)) {
					e.slot_element_invalid_name(attribute);
				}

				const slot_name = attribute.value[0].data;
				if (slot_name === 'default') {
					e.slot_element_invalid_name_default(attribute);
				}
			}
		} else if (attribute.type !== 'SpreadAttribute' && attribute.type !== 'LetDirective') {
			e.slot_element_invalid_attribute(attribute);
		}
	}

	context.next();
}

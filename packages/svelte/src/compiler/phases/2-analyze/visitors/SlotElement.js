/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { is_text_attribute } from '../../../utils/ast.js';
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';
import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {AST.SlotElement} node
 * @param {Context} context
 */
export function SlotElement(node, context) {
	if (context.state.analysis.runes && !context.state.analysis.custom_element) {
		w.slot_element_deprecated(node);
	}

	mark_subtree_dynamic(context.path);

	/** @type {string} */
	let name = 'default';

	for (const attribute of node.attributes) {
		if (attribute.type === 'Attribute') {
			if (attribute.name === 'name') {
				if (!is_text_attribute(attribute)) {
					e.slot_element_invalid_name(attribute);
				}

				name = attribute.value[0].data;
				if (name === 'default') {
					e.slot_element_invalid_name_default(attribute);
				}
			}
		} else if (attribute.type !== 'SpreadAttribute' && attribute.type !== 'LetDirective') {
			e.slot_element_invalid_attribute(attribute);
		}
	}

	context.state.analysis.slot_names.set(name, node);

	context.next();
}

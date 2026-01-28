/** @import { PropertyDefinition } from 'estree' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import { get_name } from '../../nodes.js';

/**
 * @param {PropertyDefinition} node
 * @param {Context} context
 */
export function PropertyDefinition(node, context) {
	const name = get_name(node.key);
	const field = name && context.state.state_fields.get(name);

	if (field && node !== field.node && node.value) {
		if (/** @type {number} */ (node.start) < /** @type {number} */ (field.node.start)) {
			e.state_field_invalid_assignment(node);
		}
	}

	context.next();
}

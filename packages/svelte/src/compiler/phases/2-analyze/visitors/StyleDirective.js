/** @import { StyleDirective } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {StyleDirective} node
 * @param {Context} context
 */
export function StyleDirective(node, context) {
	if (node.modifiers.length > 1 || (node.modifiers.length && node.modifiers[0] !== 'important')) {
		e.style_directive_invalid_modifier(node);
	}

	if (!context.state.analysis.runes) {
		// the case for node.value different from true is already covered by the Identifier visitor
		if (node.value === true) {
			// get the binding for node.name and change the binding to state
			let binding = context.state.scope.get(node.name);
			if (binding?.mutated && binding.kind === 'normal') {
				binding.kind = 'state';
			}
		}
	}

	context.next();
}

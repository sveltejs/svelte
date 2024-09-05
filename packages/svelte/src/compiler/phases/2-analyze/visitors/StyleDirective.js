/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';
import { get_attribute_chunks } from '../../../utils/ast.js';
import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {AST.StyleDirective} node
 * @param {Context} context
 */
export function StyleDirective(node, context) {
	if (node.modifiers.length > 1 || (node.modifiers.length && node.modifiers[0] !== 'important')) {
		e.style_directive_invalid_modifier(node);
	}

	if (node.value === true) {
		// get the binding for node.name and change the binding to state
		let binding = context.state.scope.get(node.name);

		if (binding) {
			if (binding.kind !== 'normal') {
				node.metadata.expression.has_state = true;
			}
		} else {
			w.directive_not_defined(node, node.name);
		}

		mark_subtree_dynamic(context.path);
	} else {
		if (
			!Array.isArray(node.value) &&
			node.value.expression.type === 'Identifier' &&
			!context.state.scope.get(node.value.expression.name)
		) {
			w.directive_not_defined(node, node.value.expression.name);
		}
		context.next();

		for (const chunk of get_attribute_chunks(node.value)) {
			if (chunk.type !== 'ExpressionTag') continue;

			node.metadata.expression.has_state ||= chunk.metadata.expression.has_state;
			node.metadata.expression.has_call ||= chunk.metadata.expression.has_call;
		}
	}
}

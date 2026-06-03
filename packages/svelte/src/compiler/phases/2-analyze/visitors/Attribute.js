/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { cannot_be_set_statically, can_delegate_event } from '../../../../utils.js';
import { get_attribute_chunks, is_event_attribute } from '../../../utils/ast.js';
import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {AST.Attribute} node
 * @param {Context} context
 */
export function Attribute(node, context) {
	context.next();

	const parent = /** @type {AST.SvelteNode} */ (context.path.at(-1));

	if (parent.type === 'RegularElement') {
		// special case <option value="" />
		if (node.name === 'value' && parent.name === 'option') {
			mark_subtree_dynamic(context.path);
		}
	}

	if (is_event_attribute(node)) {
		mark_subtree_dynamic(context.path);
	}

	if (cannot_be_set_statically(node.name)) {
		mark_subtree_dynamic(context.path);
	}

	// class={[...]} or class={{...}} or `class={x}` need clsx to resolve the classes
	if (
		node.name === 'class' &&
		!Array.isArray(node.value) &&
		node.value !== true &&
		node.value.expression.type !== 'Literal' &&
		node.value.expression.type !== 'TemplateLiteral' &&
		node.value.expression.type !== 'BinaryExpression'
	) {
		mark_subtree_dynamic(context.path);
		node.metadata.needs_clsx = true;
	}

	if (node.value !== true) {
		for (const chunk of get_attribute_chunks(node.value)) {
			if (chunk.type !== 'ExpressionTag') continue;

			if (
				chunk.expression.type === 'FunctionExpression' ||
				chunk.expression.type === 'ArrowFunctionExpression'
			) {
				continue;
			}
		}

		if (is_event_attribute(node)) {
			const parent = context.path.at(-1);
			if (parent?.type === 'RegularElement' || parent?.type === 'SvelteElement') {
				context.state.analysis.uses_event_attributes = true;
			}

			node.metadata.delegated =
				parent?.type === 'RegularElement' && can_delegate_event(node.name.slice(2));
		}
	}
}

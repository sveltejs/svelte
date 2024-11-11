/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { is_tag_valid_with_parent } from '../../../../html-tree-validation.js';
import * as e from '../../../errors.js';
import { is_inlinable_expression } from '../../utils.js';
import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {AST.ExpressionTag} node
 * @param {Context} context
 */
export function ExpressionTag(node, context) {
	if (node.parent && context.state.parent_element) {
		if (!is_tag_valid_with_parent('#text', context.state.parent_element)) {
			e.node_invalid_placement(node, '`{expression}`', context.state.parent_element);
		}
	}

	const attribute_parent = context.path.find((parent) => parent.type === 'Attribute');
	/**
	 * if the expression tag is part of an attribute we want to check if it's inlinable before marking
	 * the subtree as dynamic. This is because if it's inlinable it will be inlined in the template
	 * directly making the whole thing actually static.
	 */
	if (attribute_parent && !is_inlinable_expression(node, context.state.scope)) {
		// TODO ideally we wouldn't do this here, we'd just do it on encountering
		// an `Identifier` within the tag. But we currently need to handle `{42}` etc
		mark_subtree_dynamic(context.path);
	}

	context.next({ ...context.state, expression: node.metadata.expression });
}

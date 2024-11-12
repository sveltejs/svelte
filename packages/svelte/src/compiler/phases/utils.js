/** @import { AST, Binding } from '#compiler' */
/** @import { Scope } from './scope' */
/** @import * as ESTree from 'estree' */

import { walk } from 'zimmerframe';

/**
 * @param {ESTree.Expression} expr
 */
export function extract_identifiers(expr) {
	/** @type {ESTree.Identifier[]} */
	let nodes = [];

	walk(
		expr,
		{},
		{
			Identifier(node, { path }) {
				const parent = path.at(-1);
				if (parent?.type !== 'MemberExpression' || parent.property !== node || parent.computed) {
					nodes.push(node);
				}
			}
		}
	);

	return nodes;
}

/**
 * Whether a variable can be referenced directly from template string.
 * @param {Binding | undefined} binding
 * @returns {boolean}
 */
function can_inline_variable(binding) {
	return (
		!!binding &&
		// in a `<script module>` block
		!binding.scope.parent &&
		// to prevent the need for escaping
		binding.initial?.type === 'Literal'
	);
}

/**
 * @param {AST.Attribute["value"]} value
 * @param {Scope} scope
 */
export function is_inlinable_expression(value, scope) {
	if (value === true) return false; // not an expression
	let nodes = Array.isArray(value) ? value : [value];
	let has_expression_tag = false;
	for (let value of nodes) {
		if (value.type === 'ExpressionTag') {
			const identifiers = extract_identifiers(value.expression);
			// if not every identifier is inlinable we bail
			if (
				identifiers.length > 0 &&
				identifiers.some((id) => {
					const binding = scope.owner(id.name)?.declarations.get(id.name);
					return !can_inline_variable(binding);
				})
			) {
				return false;
			} else if (
				// we need to special case null and boolean values because
				// we want to set them programmatically
				value.expression.type === 'Literal' &&
				(value.expression.value === null ||
					typeof value.expression.value === 'boolean' ||
					// we also want to special case the case of a literal with quotes
					// because it could mess with the template
					(typeof value.expression.value === 'string' && value.expression.value.includes('"')))
			) {
				return false;
			}
			has_expression_tag = true;
		}
	}
	return has_expression_tag;
}

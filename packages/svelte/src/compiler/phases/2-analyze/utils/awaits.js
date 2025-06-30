/** @import { Expression, Property, SpreadElement } from 'estree' */
/** @import { AST } from '#compiler' */

/**
 *
 * @param {AST.SvelteNode[]} path
 * @param {Expression | SpreadElement | Property} node
 */
export function is_last_evaluated_expression(path, node) {
	let i = path.length;

	while (i--) {
		const parent = /** @type {Expression | Property | SpreadElement} */ (path[i]);

		// @ts-expect-error we could probably use a neater/more robust mechanism
		if (parent.metadata) {
			return true;
		}

		switch (parent.type) {
			case 'ArrayExpression':
				if (node !== parent.elements.at(-1)) return false;
				break;

			case 'AssignmentExpression':
			case 'BinaryExpression':
			case 'LogicalExpression':
				if (node === parent.left) return false;
				break;

			case 'CallExpression':
			case 'NewExpression':
				if (node !== parent.arguments.at(-1)) return false;
				break;

			case 'ConditionalExpression':
				if (node === parent.test) return false;
				break;

			case 'MemberExpression':
				if (parent.computed && node === parent.object) return false;
				break;

			case 'ObjectExpression':
				if (node !== parent.properties.at(-1)) return false;
				break;

			case 'Property':
				if (node === parent.key) return false;
				break;

			case 'SequenceExpression':
				if (node !== parent.expressions.at(-1)) return false;
				break;

			case 'TaggedTemplateExpression':
				if (node !== parent.quasi.expressions.at(-1)) return false;
				break;

			case 'TemplateLiteral':
				if (node !== parent.expressions.at(-1)) return false;
				break;

			default:
				return false;
		}

		node = parent;
	}
}

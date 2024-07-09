/** @import { Text, ExpressionTag } from '#compiler' */
/** @import { Node } from 'estree' */
const UNKNOWN = {};

/**
 * @param {Node} node
 * @param {Set<any>} set
 */
function gather_possible_values(node, set) {
	if (node.type === 'Literal') {
		set.add(String(node.value));
	} else if (node.type === 'ConditionalExpression') {
		gather_possible_values(node.consequent, set);
		gather_possible_values(node.alternate, set);
	} else {
		set.add(UNKNOWN);
	}
}

/**
 * @param {Text | ExpressionTag} chunk
 * @returns {Set<string> | null}
 */
export function get_possible_values(chunk) {
	const values = new Set();

	if (chunk.type === 'Text') {
		values.add(chunk.data);
	} else {
		gather_possible_values(chunk.expression, values);
	}

	if (values.has(UNKNOWN)) return null;
	return values;
}

export const UNKNOWN = {};

/**
 * @param {import("estree").Node} node
 * @param {Set<string | {}>} set
 */
export function gather_possible_values(node, set) {
	if (node.type === 'Literal') {
		set.add(node.value);
	} else if (node.type === 'ConditionalExpression') {
		gather_possible_values(node.consequent, set);
		gather_possible_values(node.alternate, set);
	} else {
		set.add(UNKNOWN);
	}
}

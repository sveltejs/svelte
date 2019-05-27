import { Node } from '../../interfaces';

export const UNKNOWN = {};

export function gather_possible_values(node: Node, set: Set<string|{}>) {
	if (node.type === 'Literal') {
		set.add(node.value);
	}

	else if (node.type === 'ConditionalExpression') {
		gather_possible_values(node.consequent, set);
		gather_possible_values(node.alternate, set);
	}

	else {
		set.add(UNKNOWN);
	}
}
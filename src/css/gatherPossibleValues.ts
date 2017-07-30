import { Node } from '../interfaces';

export const UNKNOWN = {};

export function gatherPossibleValues(node: Node, set: Set<string|{}>) {
	if (node.type === 'Literal') {
		set.add(node.value);
	}

	else if (node.type === 'ConditionalExpression') {
		gatherPossibleValues(node.consequent, set);
		gatherPossibleValues(node.alternate, set);
	}

	else {
		set.add(UNKNOWN);
	}
}
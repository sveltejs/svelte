import { walk } from 'estree-walker';
import isReference from '../../../utils/isReference';
import { Node } from '../../../interfaces';

export default function usesThisOrArguments(node: Node) {
	let result = false;

	walk(node, {
		enter(node: Node, parent: Node) {
			if (
				result ||
				node.type === 'FunctionExpression' ||
				node.type === 'FunctionDeclaration'
			) {
				return this.skip();
			}

			if (node.type === 'ThisExpression') {
				result = true;
			}

			if (
				node.type === 'Identifier' &&
				isReference(node, parent) &&
				node.name === 'arguments'
			) {
				result = true;
			}
		},
	});

	return result;
}

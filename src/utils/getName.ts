import { Node } from '../interfaces';

export default function getMethodName(node: Node) {
	if (node.type === 'Identifier') return node.name;
	if (node.type === 'Literal') return String(node.value);
}
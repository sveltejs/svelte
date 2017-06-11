import { Node } from '../interfaces';

export default function getObject(node: Node) {
	// TODO validation should ensure this is an Identifier or a MemberExpression
	while (node.type === 'MemberExpression') node = node.object;
	return node;
}
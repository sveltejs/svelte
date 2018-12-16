import { Node } from '../interfaces';

export default function getObject(node: Node) {
	while (node.type === 'ParenthesizedExpression') node = node.expression;
	while (node.type === 'MemberExpression') node = node.object;
	return node;
}

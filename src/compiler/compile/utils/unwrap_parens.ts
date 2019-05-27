import { Node } from '../../interfaces';

export default function unwrap_parens(node: Node) {
	while (node.type === 'ParenthesizedExpression') node = node.expression;
	return node;
}
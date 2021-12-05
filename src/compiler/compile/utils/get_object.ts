import { Node, Identifier } from 'estree';

export default function get_object(node: Node): Identifier {
	while (node.type === 'MemberExpression') node = node.object;
	return node as Identifier;
}

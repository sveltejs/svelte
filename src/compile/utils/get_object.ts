import { Node } from '../../interfaces';
import unwrap_parens from './unwrap_parens';

export default function get_object(node: Node) {
	node = unwrap_parens(node);
	while (node.type === 'MemberExpression') node = node.object;
	return node;
}

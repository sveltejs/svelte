import { Node } from 'estree';

export function is_head(node: Node) {
	return node && node.type === 'MemberExpression' && node.object['name'] === '@_document' && node.property['name'] === 'head';
}

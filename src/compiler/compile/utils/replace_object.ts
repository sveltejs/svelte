import { Node } from 'estree';

export default function replace_object(node: Node, replacement: Node) {
	if (node.type === 'Identifier') return replacement;

	const ancestor = node;
	let parent;
	while (node.type === 'MemberExpression') {
		parent = node;
		node = node.object;
	}
	parent.object = replacement;
	return ancestor;
}

import { Node } from '../interfaces';

export default function getTailSnippet(node: Node) {
	const end = node.end;
	while (node.type === 'MemberExpression') node = node.object;
	const start = node.end;

	return `[✂${start}-${end}✂]`;
}
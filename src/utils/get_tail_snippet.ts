import { Node } from '../interfaces';

export function get_tail_snippet(node: Node) {
	const { start, end } = get_tail(node);
	return `[✂${start}-${end}✂]`;
}

export function get_tail(node: Node) {
	const end = node.end;
	while (node.type === 'MemberExpression') node = node.object;
	return { start: node.end, end };
}
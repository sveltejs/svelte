import Component from '../compile/Component';
import { Node } from '../interfaces';

export default function createDebuggingComment(
	node: Node,
	component: Component
) {
	const { locate, source } = component;

	let c = node.start;
	if (node.type === 'ElseBlock') {
		while (source[c - 1] !== '{') c -= 1;
		while (source[c - 1] === '{') c -= 1;
	}

	let d = node.expression ? node.expression.node.end : c;
	while (source[d] !== '}') d += 1;
	while (source[d] === '}') d += 1;

	const start = locate(c);
	const loc = `(${start.line + 1}:${start.column})`;

	return `${loc} ${source.slice(c, d)}`.replace(/\s/g, ' ');
}

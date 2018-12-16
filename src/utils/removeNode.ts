import MagicString from 'magic-string';
import { Node } from '../interfaces';

export function removeNode(
	code: MagicString,
	start: number,
	end: number,
	body: Node,
	node: Node
) {
	const i = body.indexOf(node);
	if (i === -1) throw new Error('node not in list');

	let a;
	let b;

	if (body.length === 1) {
		// remove everything, leave {}
		a = start;
		b = end;
	} else if (i === 0) {
		// remove everything before second node, including comments
		a = start;
		while (/\s/.test(code.original[a])) a += 1;

		b = body[i].end;
		while (/[\s,]/.test(code.original[b])) b += 1;
	} else {
		// remove the end of the previous node to the end of this one
		a = body[i - 1].end;
		b = node.end;
	}

	code.remove(a, b);
	return;
}
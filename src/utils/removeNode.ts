import MagicString from 'magic-string';
import getName from '../utils/getName';
import { Node } from '../interfaces';

const keys = {
	ObjectExpression: 'properties',
	Program: 'body',
};

const offsets = {
	ObjectExpression: [1, -1],
	Program: [0, 0],
};

export function removeNode(code: MagicString, parent: Node, node: Node) {
	const key = keys[parent.type];
	const offset = offsets[parent.type];
	if (!key || !offset) throw new Error(`not implemented: ${parent.type}`);

	const list = parent[key];
	const i = list.indexOf(node);
	if (i === -1) throw new Error('node not in list');

	let a;
	let b;

	if (list.length === 1) {
		// remove everything, leave {}
		a = parent.start + offset[0];
		b = parent.end + offset[1];
	} else if (i === 0) {
		// remove everything before second node, including comments
		a = parent.start + offset[0];
		while (/\s/.test(code.original[a])) a += 1;

		b = list[i].end;
		while (/[\s,]/.test(code.original[b])) b += 1;
	} else {
		// remove the end of the previous node to the end of this one
		a = list[i - 1].end;
		b = node.end;
	}

	code.remove(a, b);
	list.splice(i, 1);
	return;
}

export function removeObjectKey(code: MagicString, node: Node, key: string) {
	if (node.type !== 'ObjectExpression') return;

	let i = node.properties.length;
	while (i--) {
		const property = node.properties[i];
		if (property.key.type === 'Identifier' && getName(property.key) === key) {
			removeNode(code, node, property);
		}
	}
}

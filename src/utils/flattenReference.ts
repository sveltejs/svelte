import { Node } from '../interfaces';

export default function flattenReference(node: Node) {
	if (node.type === 'Expression') throw new Error('bad');
	const nodes = [];
	const parts = [];
	const propEnd = node.end;

	while (node.type === 'MemberExpression') {
		if (node.computed) return null;

		nodes.unshift(node.property);
		parts.unshift(node.property.name);

		node = node.object;
	}

	const propStart = node.end;
	const name = node.type === 'Identifier'
		? node.name
		: node.type === 'ThisExpression' ? 'this' : null;

	if (!name) return null;

	parts.unshift(name);
	nodes.unshift(node);

	return { name, nodes, parts, keypath: `${name}[✂${propStart}-${propEnd}✂]` };
}

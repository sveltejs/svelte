import { Node } from '../../interfaces';

export default function flatten_reference(node: Node) {
	if (node.type === 'Expression') throw new Error('bad');
	const nodes = [];
	const parts = [];

	while (node.type === 'MemberExpression') {
		nodes.unshift(node.property);

		if (!node.computed) {
			parts.unshift(node.property.name);
		}

		node = node.object;
	}

	const name = node.type === 'Identifier'
		? node.name
		: node.type === 'ThisExpression' ? 'this' : null;

	nodes.unshift(node);

	if (!node.computed) {
		parts.unshift(name);
	}

	return { name, nodes, parts };
}

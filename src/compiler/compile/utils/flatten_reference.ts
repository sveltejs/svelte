import { Node, Identifier } from 'estree';

export default function flatten_reference(node: Node) {
	const nodes = [];
	const parts = [];

	while (node.type === 'MemberExpression') {
		nodes.unshift(node.property);

		if (!node.computed) {
			parts.unshift((node.property as Identifier).name);
		}

		node = node.object;
	}

	const name = node.type === 'Identifier'
		? node.name
		: node.type === 'ThisExpression' ? 'this' : null;

	nodes.unshift(node);

	if (!(node as any).computed) {
		parts.unshift(name);
	}

	return { name, nodes, parts };
}

import { Node, Identifier } from 'estree';

export default function flatten_reference(node: Node) {
	const nodes = [];
	const parts = [];
	
	while (node.type === 'MemberExpression') {
		nodes.unshift(node.property);

		if (!node.computed) {
			parts.unshift((node.property as Identifier).name);
		} else {
			const computed_property = to_string(node.property);
			if (computed_property) {
				parts.unshift(`[${computed_property}]`);
			}
		}
		node = node.object;
	}

	const name = node.type === 'Identifier'
		? node.name
		: node.type === 'ThisExpression' ? 'this' : null;

	nodes.unshift(node);

	parts.unshift(name);

	return { name, nodes, parts };
}

function to_string(node: Node) {
	switch (node.type) {
		case 'Literal':
			return String(node.value);
		case 'Identifier':
			return node.name;
	}
}

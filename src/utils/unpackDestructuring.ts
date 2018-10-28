export default function unpackDestructuring(
	contexts: Array<{ name: string, tail: string }>,
	node: Node,
	tail: string
) {
	if (!node) return;

	if (node.type === 'Identifier') {
		contexts.push({
			key: node,
			tail
		});
	} else if (node.type === 'ArrayPattern') {
		node.elements.forEach((element, i) => {
			unpackDestructuring(contexts, element, `${tail}[${i}]`);
		});
	} else if (node.type === 'ObjectPattern') {
		node.properties.forEach((property) => {
			unpackDestructuring(contexts, property.value, `${tail}.${property.key.name}`);
		});
	}
}
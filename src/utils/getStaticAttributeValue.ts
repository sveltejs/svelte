import { Node } from '../interfaces';

export default function getStaticAttributeValue(node: Node, name: string) {
	const attribute = node.attributes.find(
		(attr: Node) => attr.name.toLowerCase() === name
	);

	if (!attribute) return null;

	if (attribute.value.length === 0) return '';

	if (attribute.value.length === 1 && attribute.value[0].type === 'Text') {
		return attribute.value[0].data;
	}

	return null;
}

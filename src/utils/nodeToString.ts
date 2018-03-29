import { Node } from '../interfaces';

export default function nodeToString(node: Node) {
	if (node.type === 'Literal' && typeof node.value === 'string') {
		return node.value;
	} else if (node.type === 'TemplateLiteral'
	      && node.quasis.length === 1
	      && node.expressions.length === 0) {
		return node.quasis[0].value.raw;
	}
}

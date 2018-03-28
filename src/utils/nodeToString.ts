import { Node } from '../interfaces';

export default function nodeToString(prop: Node) {
	if (prop.value.type === 'Literal' && typeof prop.value.value === 'string') {
		return prop.value.value;
	} else if (prop.value.type === 'TemplateLiteral'
	      && prop.value.quasis.length === 1
	      && prop.value.expressions.length === 0) {
		return prop.value.quasis[0].value.raw;
	}
}

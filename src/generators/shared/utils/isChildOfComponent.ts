import { Node } from '../../../interfaces';
import Generator from '../../Generator';

export default function isChildOfComponent(node: Node, generator: Generator) {
	while (node = node.parent) {
		if (node.type !== 'Element') continue;
		if (generator.components.has(node.name)) return true;
		if (/-/.test(node.name)) return false;
	}
}
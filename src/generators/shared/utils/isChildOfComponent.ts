import { Node } from '../../../interfaces';
import Generator from '../../Generator';

export default function isChildOfComponent(node: Node, generator: Generator) {
	while (node = node.parent) {
		if (node.type !== 'Element') continue;
		if (node.name === ':Self' || node.name === ':Component' || generator.components.has(node.name)) return true; // TODO extract this out into a helper
		if (/-/.test(node.name)) return false;
	}
}
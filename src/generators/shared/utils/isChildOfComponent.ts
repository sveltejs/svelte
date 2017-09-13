import { Node } from '../../../interfaces';
import Generator from '../../Generator';

export default function isChildOfComponent(node: Node, generator: Generator) {
	while (node = node.parent) {
		if (node.type !== 'Element') continue;
		if (generator.components.has(node.name)) return true;
		if (/-/.test(node.name)) return false;
	}

	// TODO do this in validation
	throw new Error(`Element with a slot='...' attribute must be a descendant of a component or custom element`);
}
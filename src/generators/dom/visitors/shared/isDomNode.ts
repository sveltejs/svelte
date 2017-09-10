import { DomGenerator } from '../../index';
import { Node } from '../../../../interfaces';

export default function isDomNode(node: Node, generator: DomGenerator) {
	if (node.type === 'Element') return !generator.components.has(node.name);
	return node.type === 'Text' || node.type === 'MustacheTag';
}
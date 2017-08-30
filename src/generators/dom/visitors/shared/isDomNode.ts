import { Node } from '../../../../interfaces';

export default function isDomNode(node: Node) {
	return node.type === 'Element' || node.type === 'Text' || node.type === 'MustacheTag';
}
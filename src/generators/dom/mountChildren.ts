import CodeBuilder from '../../utils/CodeBuilder';
import { Node } from '../../interfaces';
import Block from './Block';

export default function mountChildren(node: Node, parentNode?: string) {
	const builder = new CodeBuilder();

	let consecutiveNodes: string[] = [];

	function flush() {
		if (consecutiveNodes.length === 0) return;

		if (parentNode) {
			builder.addLine(`@append(${parentNode}, ${consecutiveNodes.join(', ')});`);
		} else {
			builder.addLine(`@insert(#target, anchor, ${consecutiveNodes.join(', ')});`);
		}

		consecutiveNodes = [];
	}

	node.children.forEach((child: Node) => {
		if (child.mountStatement) {
			flush();

			// TODO determining whether to use line or block should probably
			// happen inside CodeBuilder
			if (/\n/.test(child.mountStatement)) {
				builder.addBlock(child.mountStatement);
			} else {
				builder.addLine(child.mountStatement);
			}
		} else {
			if (child.shouldSkip) return;
			if (child.type === 'Element' && child.name === ':Window') return;

			consecutiveNodes.push(child.var);
		}
	});

	flush();

	return builder;
}
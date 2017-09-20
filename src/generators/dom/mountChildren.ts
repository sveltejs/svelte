import CodeBuilder from '../../utils/CodeBuilder';
import { Node } from '../../interfaces';
import Block from './Block';

export default function mountChildren(node: Node, parentNode?: string) {
	const builder = new CodeBuilder();

	node.children.forEach((child: Node) => {
		if (child.mountStatement) {
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

			if (parentNode) {
				builder.addLine(`@appendNode(${child.var}, ${parentNode});`);
			} else {
				builder.addLine(`@insertNode(${child.var}, #target, anchor);`);
			}
		}
	});

	return builder;
}
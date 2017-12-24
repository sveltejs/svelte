import { SsrGenerator } from '../index';
import Block from '../Block';
import { escape } from '../../../utils/stringify';
import visit from '../visit';
import { Node } from '../../../interfaces';

export default function visitTitle(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	generator.append(`<title>`);

	node.children.forEach((child: Node) => {
		visit(generator, block, child);
	});

	generator.append(`</title>`);
}

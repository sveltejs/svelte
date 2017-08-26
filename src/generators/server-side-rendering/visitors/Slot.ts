import visit from '../visit';
import { SsrGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';

export default function visitSlot(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	// TODO named slots
	generator.append(`<slot>\${options && options.slotted && options.slotted.default ? options.slotted.default() : '`);

	generator.elementDepth += 1;

	node.children.forEach((child: Node) => {
		visit(generator, block, child);
	});

	generator.elementDepth -= 1;

	generator.append(`'}</slot>`);
}

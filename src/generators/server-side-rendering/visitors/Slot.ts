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
	const name = node.attributes.find((attribute: Node) => attribute.name);
	const slotName = name && name.value[0].data || 'default';

	generator.append(`\${options && options.slotted && options.slotted.${slotName} ? options.slotted.${slotName}() : '`);

	generator.elementDepth += 1;

	node.children.forEach((child: Node) => {
		visit(generator, block, child);
	});

	generator.elementDepth -= 1;

	generator.append(`'}`);
}

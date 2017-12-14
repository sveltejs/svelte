import { SsrGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';
import stringifyAttributeValue from './shared/stringifyAttributeValue';
import visit from '../visit';

export default function visitDocument(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	generator.append('${(__result.head += `');

	node.children.forEach((child: Node) => {
		visit(generator, block, child);
	});

	generator.append('`, "")}');
}
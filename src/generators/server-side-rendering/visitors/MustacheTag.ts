import { SsrGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';

export default function visitMustacheTag(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	block.contextualise(node.expression);
	const { snippet } = node.metadata;

	generator.append('${__escape(' + snippet + ')}');
}

import { SsrGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';

export default function visitRawMustacheTag(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	block.contextualise(node.expression);
	const { snippet } = node.metadata;

	generator.append('${' + snippet + '}');
}

import visitors from './visitors/index';
import { SsrGenerator } from './index';
import Block from './Block';
import { Node } from '../../interfaces';

export default function visit(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	const visitor = visitors[node.type];
	visitor(generator, block, node);
}

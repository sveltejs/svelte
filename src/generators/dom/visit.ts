import visitors from './visitors/index';
import { DomGenerator } from './index';
import Block from './Block';
import { Node } from '../../interfaces';

export default function visit(
	generator: DomGenerator,
	block: Block,
	state,
	node: Node
) {
	const visitor = visitors[node.type];
	visitor(generator, block, state, node);
}

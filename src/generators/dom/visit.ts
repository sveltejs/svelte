import visitors from './visitors/index';
import { DomGenerator } from './index';
import Block from './Block';
import { Node } from '../../interfaces';
import { State } from './interfaces';

export default function visit(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	elementStack: Node[]
) {
	const visitor = visitors[node.type];
	visitor(generator, block, state, node, elementStack);
}

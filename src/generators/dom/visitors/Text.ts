import { DomGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';
import { State } from '../interfaces';
import stringify from '../../../utils/stringify';

export default function visitText(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node
) {
	if (!node._state.shouldCreate) return;
	block.addElement(
		node._state.name,
		`@createText( ${stringify(node.data)} )`,
		generator.hydratable ? `@claimText( ${state.parentNodes}, ${stringify(node.data)} )` : '',
		state.parentNode,
		node.usedAsAnchor
	);
}

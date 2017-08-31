import { DomGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';
import { State } from '../interfaces';
import { stringify } from '../../../utils/stringify';

export default function visitText(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node
) {
	if (node.shouldSkip) return;

	block.addElement(
		node.var,
		`@createText( ${stringify(node.data)} )`,
		`@claimText( ${state.parentNodes}, ${stringify(node.data)} )`,
		state.parentNode
	);
}

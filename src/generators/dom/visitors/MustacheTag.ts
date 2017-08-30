import deindent from '../../../utils/deindent';
import visitTag from './shared/Tag';
import { DomGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';
import { State } from '../interfaces';

export default function visitMustacheTag(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node
) {
	const { init } = visitTag(
		generator,
		block,
		state,
		node,
		node.var,
		value => `${node.var}.data = ${value};`
	);

	block.addElement(
		node.var,
		`@createText( ${init} )`,
		`@claimText( ${state.parentNodes}, ${init} )`,
		state.parentNode
	);
}

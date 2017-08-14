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
	const { name } = node._state;

	const { init } = visitTag(
		generator,
		block,
		state,
		node,
		name,
		value => `${name}.data = ${value};`
	);

	block.addElement(
		name,
		`@createText( ${init} )`,
		`@claimText( ${state.parentNodes}, ${init} )`,
		state.parentNode
	);
}

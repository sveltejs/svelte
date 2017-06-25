import deindent from '../../../utils/deindent';
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
	const name = node._state.name;
	const value = block.getUniqueName(`${name}_value`);

	const { snippet } = block.contextualise(node.expression);

	block.addVariable(value);
	block.addElement(
		name,
		`@createText( ${value} = ${snippet} )`,
		generator.hydratable ? `@claimText( ${state.parentNodes}, ${value} = ${snippet} )` : '',
		state.parentNode,
		true
	);

	block.builders.update.addBlock(deindent`
		if ( ${value} !== ( ${value} = ${snippet} ) ) {
			${name}.data = ${value};
		}
	`);
}

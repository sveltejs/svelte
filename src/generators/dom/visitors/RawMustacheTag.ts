import deindent from '../../../utils/deindent';
import { DomGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';
import { State } from '../interfaces';

export default function visitRawMustacheTag(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node
) {
	const name = node._state.basename;
	const before = node._state.name;
	const value = block.getUniqueName(`${name}_value`);
	const after = block.getUniqueName(`${name}_after`);

	const { snippet } = block.contextualise(node.expression);

	block.addVariable(value);

	// we would have used comments here, but the `insertAdjacentHTML` api only
	// exists for `Element`s.
	block.addElement(
		before,
		`${generator.helper('createElement')}( 'noscript' )`,
		`${generator.helper('createElement')}( 'noscript' )`,
		state.parentNode,
		true
	);
	block.addElement(
		after,
		`${generator.helper('createElement')}( 'noscript' )`,
		`${generator.helper('createElement')}( 'noscript' )`,
		state.parentNode,
		true
	);

	const isToplevel = !state.parentNode;

	const mountStatement = `${before}.insertAdjacentHTML( 'afterend', ${value} = ${snippet} );`;
	const detachStatement = `${generator.helper(
		'detachBetween'
	)}( ${before}, ${after} );`;

	block.builders.mount.addLine(mountStatement);

	block.builders.update.addBlock(deindent`
		if ( ${value} !== ( ${value} = ${snippet} ) ) {
			${detachStatement}
			${mountStatement}
		}
	`);

	block.builders.detachRaw.addBlock(detachStatement);
}

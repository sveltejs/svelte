import deindent from '../../../utils/deindent';
import addUpdateBlock from './shared/addUpdateBlock';
import visitTag from './shared/Tag';
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
	const after = block.getUniqueName(`${name}_after`);

	const { init } = visitTag(
		generator,
		block,
		state,
		node,
		name,
		value => deindent`
			@detachBetween( ${before}, ${after} );
			${before}.insertAdjacentHTML( 'afterend', ${value} );
		`
	);

	// we would have used comments here, but the `insertAdjacentHTML` api only
	// exists for `Element`s.
	block.addElement(
		before,
		`@createElement( 'noscript' )`,
		`@createElement( 'noscript' )`,
		state.parentNode
	);

	block.addElement(
		after,
		`@createElement( 'noscript' )`,
		`@createElement( 'noscript' )`,
		state.parentNode
	);

	block.builders.mount.addLine(`${before}.insertAdjacentHTML( 'afterend', ${init} );`);
	block.builders.detachRaw.addBlock(`@detachBetween( ${before}, ${after} );`);
}
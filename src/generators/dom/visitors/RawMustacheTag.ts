import deindent from '../../../utils/deindent';
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
	const name = node.var;

	const needsAnchorBefore = node.prev ? node.prev.type !== 'Element' : !state.parentNode;
	const needsAnchorAfter = node.next ? node.next.type !== 'Element' : !state.parentNode;

	const anchorBefore = needsAnchorBefore
		? block.getUniqueName(`${name}_before`)
		: (node.prev && node.prev.var) || 'null';

	const anchorAfter = needsAnchorAfter
		? block.getUniqueName(`${name}_after`)
		: (node.next && node.next.var) || 'null';

	let detach: string;
	let insert: (content: string) => string;

	if (anchorBefore === 'null' && anchorAfter === 'null') {
		detach = `${state.parentNode}.innerHTML = '';`;
		insert = content => `${state.parentNode}.innerHTML = ${content};`;
	} else if (anchorBefore === 'null') {
		detach = `@detachBefore(${anchorAfter});`;
		insert = content => `${anchorAfter}.insertAdjacentHTML('beforebegin', ${content});`;
	} else if (anchorAfter === 'null') {
		detach = `@detachAfter(${anchorBefore});`;
		insert = content => `${anchorBefore}.insertAdjacentHTML('afterend', ${content});`;
	} else {
		detach = `@detachBetween(${anchorBefore}, ${anchorAfter});`;
		insert = content => `${anchorBefore}.insertAdjacentHTML('afterend', ${content});`;
	}

	const { init } = visitTag(
		generator,
		block,
		state,
		node,
		name,
		content => deindent`
			${detach}
			${insert(content)}
		`
	);

	// we would have used comments here, but the `insertAdjacentHTML` api only
	// exists for `Element`s.
	if (needsAnchorBefore) {
		block.addElement(
			anchorBefore,
			`@createElement( 'noscript' )`,
			`@createElement( 'noscript' )`,
			state.parentNode
		);
	}

	function addAnchorAfter() {
		block.addElement(
			anchorAfter,
			`@createElement( 'noscript' )`,
			`@createElement( 'noscript' )`,
			state.parentNode
		);
	}

	if (needsAnchorAfter && anchorBefore === 'null') {
		// anchorAfter needs to be in the DOM before we
		// insert the HTML...
		addAnchorAfter();
	}

	block.builders.mount.addLine(insert(init));
	block.builders.detachRaw.addBlock(detach);

	if (needsAnchorAfter && anchorBefore !== 'null') {
		// ...otherwise it should go afterwards
		addAnchorAfter();
	}
}
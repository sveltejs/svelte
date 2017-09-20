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
	let useInnerHTML = false;

	if (anchorBefore === 'null' && anchorAfter === 'null') {
		useInnerHTML = true;
		detach = `${state.parentNode}.innerHTML = '';`;
		insert = content => `${state.parentNode}.innerHTML = ${content};`;
	} else if (anchorBefore === 'null') {
		detach = `@detachBefore(${anchorAfter});`;
		insert = content => `${anchorAfter}.insertAdjacentHTML("beforebegin", ${content});`;
	} else if (anchorAfter === 'null') {
		detach = `@detachAfter(${anchorBefore});`;
		insert = content => `${anchorBefore}.insertAdjacentHTML("afterend", ${content});`;
	} else {
		detach = `@detachBetween(${anchorBefore}, ${anchorAfter});`;
		insert = content => `${anchorBefore}.insertAdjacentHTML("afterend", ${content});`;
	}

	const { init } = visitTag(
		generator,
		block,
		state,
		node,
		name,
		content => deindent`
			${!useInnerHTML && detach}
			${insert(content)}
		`
	);

	let mountStatements: string[] = [];

	if (needsAnchorBefore) {
		block.addElement(
			anchorBefore,
			`@createElement('noscript')`,
			`@createElement('noscript')`,
			state.parentNode
		);

		mountStatements.push(
			state.parentNode ? `@appendNode(${anchorBefore}, ${state.parentNode});` : `@insertNode(${anchorBefore}, #target, anchor);`
		);
	}

	function addAnchorAfter() {
		block.addElement(
			anchorAfter,
			`@createElement('noscript')`,
			`@createElement('noscript')`,
			state.parentNode
		);

		mountStatements.push(
			state.parentNode ? `@appendNode(${anchorAfter}, ${state.parentNode});` : `@insertNode(${anchorAfter}, #target, anchor);`
		);
	}

	if (needsAnchorAfter && anchorBefore === 'null') addAnchorAfter();
	mountStatements.push(insert(init));
	if (needsAnchorAfter && anchorBefore !== 'null') addAnchorAfter();

	node.mountStatement = mountStatements.join('\n');

	block.builders.detachRaw.addBlock(detach);
}
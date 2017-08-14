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
	const after = block.getUniqueName(`${name}_after`);

	const { dependencies, indexes, snippet } = block.contextualise(node.expression);

	const hasChangeableIndex = Array.from(indexes).some(index => block.changeableIndexes.get(index));

	const shouldCache = (
		node.expression.type !== 'Identifier' ||
		block.contexts.has(node.expression.name) ||
		hasChangeableIndex
	);

	const value = shouldCache && block.getUniqueName(`${name}_value`);
	const init = shouldCache ? `${value} = ${snippet}` : snippet;
	if (shouldCache) block.addVariable(value);

	// we would have used comments here, but the `insertAdjacentHTML` api only
	// exists for `Element`s.
	block.addElement(
		before,
		`@createElement( 'noscript' )`,
		`@createElement( 'noscript' )`,
		state.parentNode,
		true
	);
	block.addElement(
		after,
		`@createElement( 'noscript' )`,
		`@createElement( 'noscript' )`,
		state.parentNode,
		true
	);

	const isToplevel = !state.parentNode;

	block.builders.mount.addLine(`${before}.insertAdjacentHTML( 'afterend', ${init} );`);
	block.builders.detachRaw.addBlock(`@detachBetween( ${before}, ${after} );`);

	if (dependencies.length || hasChangeableIndex) {
		const changedCheck = (
			( block.hasOutroMethod ? `#outroing || ` : '' ) +
			dependencies.map(dependency => `'${dependency}' in changed`).join(' || ')
		);

		const updateCachedValue = `${value} !== ( ${value} = ${snippet} )`;

		const condition = shouldCache ?
			( dependencies.length ? `( ${changedCheck} ) && ${updateCachedValue}` : updateCachedValue ) :
			changedCheck;

		block.builders.update.addConditionalLine(
			condition,
			deindent`
				@detachBetween( ${before}, ${after} );
				${before}.insertAdjacentHTML( 'afterend', ${shouldCache ? value : snippet} );
			`
		);
	}
}

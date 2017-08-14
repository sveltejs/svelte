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
	const { dependencies, indexes, snippet } = block.contextualise(node.expression);

	const hasChangeableIndex = Array.from(indexes).some(index => block.changeableIndexes.get(index));

	const shouldCache = (
		node.expression.type !== 'Identifier' ||
		block.contexts.has(node.expression.name) ||
		hasChangeableIndex
	);

	const name = node._state.name;
	const value = shouldCache && block.getUniqueName(`${name}_value`);
	const init = shouldCache ? `${value} = ${snippet}` : snippet;

	if (shouldCache) block.addVariable(value);

	block.addElement(
		name,
		`@createText( ${init} )`,
		generator.hydratable
			? `@claimText( ${state.parentNodes}, ${init} )`
			: '',
		state.parentNode,
		true
	);

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
			`${name}.data = ${shouldCache ? value : snippet};`
		);
	}
}

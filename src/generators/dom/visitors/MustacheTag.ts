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
	const { dependencies, snippet } = block.contextualise(node.expression);

	const shouldCache = node.expression.type !== 'Identifier' || block.contexts.has(node.expression.name);

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

	if (dependencies.length) {
		const changedCheck = (
			( block.hasOutroMethod ? `#outroing || ` : '' ) +
			dependencies.map(dependency => `'${dependency}' in changed`).join(' || ')
		);

		const condition = shouldCache ?
			`( ${changedCheck} ) && ${value} !== ( ${value} = ${snippet} )` :
			changedCheck;

		block.builders.update.addConditionalLine(
			condition,
			`${name}.data = ${shouldCache ? value : snippet};`
		);
	}
}

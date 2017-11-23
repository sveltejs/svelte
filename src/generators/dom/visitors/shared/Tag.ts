import deindent from '../../../../utils/deindent';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';

export default function visitTag(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	name: string,
	update: (value: string) => string
) {
	const { indexes } = block.contextualise(node.expression);
	const { dependencies, snippet } = node.metadata;

	const hasChangeableIndex = Array.from(indexes).some(index => block.changeableIndexes.get(index));

	const shouldCache = (
		node.expression.type !== 'Identifier' ||
		block.contexts.has(node.expression.name) ||
		hasChangeableIndex
	);

	const value = shouldCache && block.getUniqueName(`${name}_value`);
	const content = shouldCache ? value : snippet;

	if (shouldCache) block.addVariable(value, snippet);

	if (dependencies.length || hasChangeableIndex) {
		const changedCheck = (
			(block.hasOutroMethod ? `#outroing || ` : '') +
			dependencies.map((dependency: string) => `changed.${dependency}`).join(' || ')
		);

		const updateCachedValue = `${value} !== (${value} = ${snippet})`;

		const condition = shouldCache ?
			(dependencies.length ? `(${changedCheck}) && ${updateCachedValue}` : updateCachedValue) :
			changedCheck;

		block.builders.update.addConditional(
			condition,
			update(content)
		);
	}

	return { init: content };
}

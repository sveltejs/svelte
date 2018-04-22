import Node from './Node';
import Expression from './Expression';
import Block from '../../dom/Block';

export default class Tag extends Node {
	expression: Expression;

	constructor(compiler, parent, info) {
		super(compiler, parent, info);
		this.expression = new Expression(compiler, info.expression);
	}

	renameThisMethod(
		block: Block,
		update: ((value: string) => string)
	) {
		const { indexes } = block.contextualise(this.expression);
		const { dependencies, snippet } = this.metadata;

		const hasChangeableIndex = Array.from(indexes).some(index => block.changeableIndexes.get(index));

		const shouldCache = (
			this.expression.type !== 'Identifier' ||
			block.contexts.has(this.expression.name) ||
			hasChangeableIndex
		);

		const value = shouldCache && block.getUniqueName(`${this.var}_value`);
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
}
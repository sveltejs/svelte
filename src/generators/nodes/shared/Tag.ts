import Node from './Node';
import Expression from './Expression';
import Block from '../../dom/Block';

export default class Tag extends Node {
	expression: Expression;

	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);
		this.expression = new Expression(compiler, this, scope, info.expression);
	}

	renameThisMethod(
		block: Block,
		update: ((value: string) => string)
	) {
		const { snippet, dependencies, indexes } = this.expression;

		const hasChangeableIndex = Array.from(indexes).some(index => block.changeableIndexes.get(index));

		const shouldCache = (
			this.expression.node.type !== 'Identifier' ||
			block.contexts.has(this.expression.node.name) ||
			hasChangeableIndex
		);

		const value = shouldCache && block.getUniqueName(`${this.var}_value`);
		const content = shouldCache ? value : snippet;

		if (shouldCache) block.addVariable(value, snippet);

		if (dependencies.size || hasChangeableIndex) {
			const changedCheck = (
				(block.hasOutroMethod ? `#outroing || ` : '') +
				[...dependencies].map((dependency: string) => `changed.${dependency}`).join(' || ')
			);

			const updateCachedValue = `${value} !== (${value} = ${snippet})`;

			const condition = shouldCache ?
				(dependencies.size ? `(${changedCheck}) && ${updateCachedValue}` : updateCachedValue) :
				changedCheck;

			block.builders.update.addConditional(
				condition,
				update(content)
			);
		}

		return { init: content };
	}
}
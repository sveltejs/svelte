import Node from './Node';
import Expression from './Expression';
import Block from '../../dom/Block';

export default class Tag extends Node {
	expression: Expression;
	shouldCache: boolean;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);
		this.expression = new Expression(component, this, scope, info.expression);

		this.shouldCache = (
			info.expression.type !== 'Identifier' ||
			(this.expression.dependencies.size && scope.names.has(info.expression.name))
		);
	}

	init(block: Block) {
		this.cannotUseInnerHTML();
		this.var = block.getUniqueName(this.type === 'MustacheTag' ? 'text' : 'raw');
		block.addDependencies(this.expression.dependencies);
	}

	renameThisMethod(
		block: Block,
		update: ((value: string) => string)
	) {
		const { snippet, dependencies } = this.expression;

		const value = this.shouldCache && block.getUniqueName(`${this.var}_value`);
		const content = this.shouldCache ? value : snippet;

		if (this.shouldCache) block.addVariable(value, snippet);

		if (dependencies.size) {
			const changedCheck = (
				(block.hasOutros ? `!#current || ` : '') +
				[...dependencies].map((dependency: string) => `changed.${dependency}`).join(' || ')
			);

			const updateCachedValue = `${value} !== (${value} = ${snippet})`;

			const condition = this.shouldCache ?
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
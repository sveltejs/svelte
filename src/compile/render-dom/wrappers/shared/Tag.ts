import Wrapper from './Wrapper';
import Renderer from '../../Renderer';
import Block from '../../Block';
import MustacheTag from '../../../nodes/MustacheTag';
import RawMustacheTag from '../../../nodes/RawMustacheTag';

export default class Tag extends Wrapper {
	node: MustacheTag | RawMustacheTag;

	constructor(renderer: Renderer, block: Block, parent: Wrapper, node: MustacheTag | RawMustacheTag) {
		super(renderer, block, parent, node);
		this.cannotUseInnerHTML();

		block.addDependencies(node.expression.dynamic_dependencies);
	}

	renameThisMethod(
		block: Block,
		update: ((value: string) => string)
	) {
		const dependencies = this.node.expression.dynamic_dependencies;
		const snippet = this.node.expression.render();

		const value = this.node.shouldCache && block.getUniqueName(`${this.var}_value`);
		const content = this.node.shouldCache ? value : snippet;

		if (this.node.shouldCache) block.addVariable(value, snippet);

		if (dependencies.size) {
			const changedCheck = (
				(block.hasOutros ? `!#current || ` : '') +
				[...dependencies].map((dependency: string) => `changed.${dependency}`).join(' || ')
			);

			const updateCachedValue = `${value} !== (${value} = ${snippet})`;

			const condition =this.node.shouldCache
				? dependencies.size > 0
					? `(${changedCheck}) && ${updateCachedValue}`
					: updateCachedValue
				: changedCheck;

			block.builders.update.addConditional(
				condition,
				update(content)
			);
		}

		return { init: content };
	}

	remount(name: string) {
		return `@append(${name}.$$.slotted.default, ${this.var});`;
	}
}
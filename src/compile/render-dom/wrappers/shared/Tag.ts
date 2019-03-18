import Wrapper from './Wrapper';
import Renderer from '../../Renderer';
import Block from '../../Block';
import MustacheTag from '../../../nodes/MustacheTag';
import RawMustacheTag from '../../../nodes/RawMustacheTag';

export default class Tag extends Wrapper {
	node: MustacheTag | RawMustacheTag;

	constructor(renderer: Renderer, block: Block, parent: Wrapper, node: MustacheTag | RawMustacheTag) {
		super(renderer, block, parent, node);
		this.cannot_use_innerhtml();

		block.add_dependencies(node.expression.dependencies);
	}

	rename_this_method(
		block: Block,
		update: ((value: string) => string)
	) {
		const dependencies = this.node.expression.dynamic_dependencies();
		const snippet = this.node.expression.render(block);

		const value = this.node.should_cache && block.get_unique_name(`${this.var}_value`);
		const content = this.node.should_cache ? value : snippet;

		if (this.node.should_cache) block.add_variable(value, snippet);

		if (dependencies.length > 0) {
			const changed_check = (
				(block.has_outros ? `!#current || ` : '') +
				dependencies.map((dependency: string) => `changed.${dependency}`).join(' || ')
			);

			const update_cached_value = `${value} !== (${value} = ${snippet})`;

			const condition =this.node.should_cache
				? `(${changed_check}) && ${update_cached_value}`
				: changed_check;

			block.builders.update.add_conditional(
				condition,
				update(content)
			);
		}

		return { init: content };
	}
}
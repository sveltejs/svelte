import Expression from './shared/Expression.ts';
import map_children from './shared/map_children.ts';
import AbstractBlock from './shared/AbstractBlock.ts';

export default class KeyBlock extends AbstractBlock {
	type: 'KeyBlock';

	expression: Expression;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.expression = new Expression(component, this, scope, info.expression);

		this.children = map_children(component, this, scope, info.children);

		this.warn_if_empty_block();
	}
}

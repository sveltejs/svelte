import ElseBlock from './ElseBlock.ts';
import Expression from './shared/Expression.ts';
import map_children from './shared/map_children.ts';
import AbstractBlock from './shared/AbstractBlock.ts';

export default class IfBlock extends AbstractBlock {
	type: 'IfBlock';
	expression: Expression;
	else: ElseBlock;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.expression = new Expression(component, this, scope, info.expression);
		this.children = map_children(component, this, scope, info.children);

		this.else = info.else
			? new ElseBlock(component, this, scope, info.else)
			: null;

		this.warn_if_empty_block();
	}
}

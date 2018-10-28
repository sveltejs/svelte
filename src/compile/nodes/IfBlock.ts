import Node from './shared/Node';
import ElseBlock from './ElseBlock';
import Block from '../render-dom/Block';
import Expression from './shared/Expression';
import mapChildren from './shared/mapChildren';

export default class IfBlock extends Node {
	type: 'IfBlock';
	expression: Expression;
	children: any[];
	else: ElseBlock;

	block: Block;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.expression = new Expression(component, this, scope, info.expression);
		this.children = mapChildren(component, this, scope, info.children);

		this.else = info.else
			? new ElseBlock(component, this, scope, info.else)
			: null;

		this.warnIfEmptyBlock();
	}
}
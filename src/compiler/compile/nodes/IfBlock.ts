import ElseBlock from './ElseBlock';
import Expression from './shared/Expression';
import map_children from './shared/map_children';
import AbstractBlock from './shared/AbstractBlock';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { TemplateNode } from '../../interfaces';
import Node from './shared/Node';

export default class IfBlock extends AbstractBlock {
	type: 'IfBlock';
	expression: Expression;
	else: ElseBlock;

	constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		this.expression = new Expression(component, this, scope, info.expression);
		this.children = map_children(component, this, scope, info.children);

		this.else = info.else
			? new ElseBlock(component, this, scope, info.else)
			: null;

		this.warn_if_empty_block();
	}
}

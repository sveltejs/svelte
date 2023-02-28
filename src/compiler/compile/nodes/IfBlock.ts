import ElseBlock from './ElseBlock';
import Expression from './shared/Expression';
import AbstractBlock from './shared/AbstractBlock';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { TemplateNode } from '../../interfaces';
import Node from './shared/Node';
import ConstTag from './ConstTag';
import get_const_tags from './shared/get_const_tags';

export default class IfBlock extends AbstractBlock {
	type: 'IfBlock';
	expression: Expression;
	else: ElseBlock;
	scope: TemplateScope;
	const_tags: ConstTag[];

	constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);
		this.scope = scope.child();

		this.expression = new Expression(component, this, this.scope, info.expression);
		([this.const_tags, this.children] = get_const_tags(info.children, component, this, this));

		this.else = info.else
			? new ElseBlock(component, this, scope, info.else)
			: null;

		this.warn_if_empty_block();
	}
}

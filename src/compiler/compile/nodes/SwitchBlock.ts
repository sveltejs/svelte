import AbstractBlock from './shared/AbstractBlock';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { TemplateNode } from '../../interfaces';
import Node from './shared/Node';
import CaseBlock from './CaseBlock';
import Expression from './shared/Expression';

export default class SwitchBlock extends AbstractBlock {
	type: 'SwitchBlock';
	cases: CaseBlock[];
	discriminant: Expression;
	scope: TemplateScope;

	constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);
		this.scope = scope.child();

		this.discriminant = new Expression(component, this, this.scope, info.disccriminant);

		this.cases = info.cases?.length
			? info.cases.map(c => new CaseBlock(component, this, scope, c)) 
			: [];

		this.warn_if_empty_block();
	}
}

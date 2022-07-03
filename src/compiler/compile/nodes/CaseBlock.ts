import AbstractBlock from './shared/AbstractBlock';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { TemplateNode } from '../../interfaces';
import ConstTag from './ConstTag';
import get_const_tags from './shared/get_const_tags';
import Expression from './shared/Expression';
import SwitchBlock from './SwitchBlock';

export default class CaseBlock extends AbstractBlock {
	type: 'CaseBlock';
	is_default: boolean;
	test?: Expression;
	scope: TemplateScope;
	const_tags: ConstTag[];

	constructor(component: Component, parent: SwitchBlock, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);
		this.scope = scope.child();

		this.test = info.test;
		this.is_default = info.isdefault ?? false;

		if (!this.is_default) {
			this.test = new Expression(component, this, this.scope, info.test);
		}

		([this.const_tags, this.children] = get_const_tags(info.children, component, this, this));
		
		this.warn_if_empty_block();
	}
}

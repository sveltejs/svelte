import AbstractBlock from './shared/AbstractBlock';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { TemplateNode } from '../../interfaces';
import Node from './shared/Node';
import ConstTag from './ConstTag';
import get_const_tags from './shared/get_const_tags';

export default class ElseBlock extends AbstractBlock {
	type: 'ElseBlock';
	scope: TemplateScope;
	const_tags: ConstTag[];

	constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		this.scope = scope.child();
		([this.const_tags, this.children] = get_const_tags(info.children, component, this, this));

		this.warn_if_empty_block();
	}
}

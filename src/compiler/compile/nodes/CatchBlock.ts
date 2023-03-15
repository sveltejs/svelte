import TemplateScope from './shared/TemplateScope';
import AbstractBlock from './shared/AbstractBlock';
import AwaitBlock from './AwaitBlock';
import Component from '../Component';
import { TemplateNode } from '../../interfaces';
import get_const_tags from './shared/get_const_tags';
import ConstTag from './ConstTag';

export default class CatchBlock extends AbstractBlock {
	type: 'CatchBlock';
	scope: TemplateScope;
	const_tags: ConstTag[];

	constructor(component: Component, parent: AwaitBlock, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		this.scope = scope.child();
		if (parent.catch_node) {
			parent.catch_contexts.forEach(context => {
				if (context.type !== 'DestructuredVariable') return;
				this.scope.add(context.key.name, parent.expression.dependencies, this);
			});
		}

		([this.const_tags, this.children] = get_const_tags(info.children, component, this, parent));

		if (!info.skip) {
			this.warn_if_empty_block();
		}
	}
}

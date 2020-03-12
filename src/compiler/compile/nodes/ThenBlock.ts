import map_children from './shared/map_children';
import TemplateScope from './shared/TemplateScope';
import AbstractBlock from './shared/AbstractBlock';
import AwaitBlock from './AwaitBlock';
import Component from '../Component';
import { TemplateNode } from '../../interfaces';

export default class ThenBlock extends AbstractBlock {
	type: 'ThenBlock';
	scope: TemplateScope;

	constructor(component: Component, parent: AwaitBlock, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		this.scope = scope.child();
		if (parent.value) {
			parent.value.expressions.forEach(expression => {
				this.scope.add(expression, parent.expression.dependencies, this);
			});
		}
		this.children = map_children(component, parent, this.scope, info.children);

		if (!info.skip) {
			this.warn_if_empty_block();
		}
	}
}

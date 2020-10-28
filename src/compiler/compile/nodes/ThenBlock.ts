import map_children from './shared/map_children.ts';
import TemplateScope from './shared/TemplateScope.ts';
import AbstractBlock from './shared/AbstractBlock.ts';
import AwaitBlock from './AwaitBlock.ts';
import Component from '../Component.ts';
import { TemplateNode } from '../../interfaces.ts';

export default class ThenBlock extends AbstractBlock {
	type: 'ThenBlock';
	scope: TemplateScope;

	constructor(component: Component, parent: AwaitBlock, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		this.scope = scope.child();
		if (parent.then_node) {
			parent.then_contexts.forEach(context => {
				this.scope.add(context.key.name, parent.expression.dependencies, this);
			});
		}
		this.children = map_children(component, parent, this.scope, info.children);

		if (!info.skip) {
			this.warn_if_empty_block();
		}
	}
}

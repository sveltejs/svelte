import map_children from './shared/map_children.ts';
import AbstractBlock from './shared/AbstractBlock.ts';
import Component from '../Component.ts';

export default class ElseBlock extends AbstractBlock {
	type: 'ElseBlock';

	constructor(component: Component, parent, scope, info) {
		super(component, parent, scope, info);
		this.children = map_children(component, this, scope, info.children);

		this.warn_if_empty_block();
	}
}

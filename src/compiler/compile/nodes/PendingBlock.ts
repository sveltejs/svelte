import map_children from './shared/map_children';
import AbstractBlock from './shared/AbstractBlock';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { TemplateNode } from '../../interfaces';
import Node from './shared/Node';

export default class PendingBlock extends AbstractBlock {
	type: 'PendingBlock';
	constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);
		this.children = map_children(component, parent, scope, info.children);

		if (!info.skip) {
			this.warn_if_empty_block();
		}
	}
}

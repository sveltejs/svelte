import Expression from './shared/Expression';
import map_children from './shared/map_children';
import AbstractBlock from './shared/AbstractBlock';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { TemplateNode } from '../../interfaces';
import Node from './shared/Node';

export default class KeyBlock extends AbstractBlock {
	type: 'KeyBlock';

	expression: Expression;

	constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		this.expression = new Expression(component, this, scope, info.expression);

		this.children = map_children(component, this, scope, info.children);

		this.warn_if_empty_block();
	}
}

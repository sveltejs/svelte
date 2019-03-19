import Node from './shared/Node';
import Component from '../Component';
import map_children from './shared/map_children';
import Block from '../render-dom/Block';
import TemplateScope from './shared/TemplateScope';

export default class Fragment extends Node {
	block: Block;
	children: Node[];
	scope: TemplateScope;

	constructor(component: Component, info: any) {
		const scope = new TemplateScope();
		super(component, null, scope, info);

		this.scope = scope;
		this.children = map_children(component, this, scope, info.children);
	}
}
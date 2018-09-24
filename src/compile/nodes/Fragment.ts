import Node from './shared/Node';
import Component from '../Component';
import mapChildren from './shared/mapChildren';
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
		this.children = mapChildren(component, this, scope, info.children);
	}
}
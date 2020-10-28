import Node from './shared/Node.ts';
import Component from '../Component.ts';
import map_children from './shared/map_children.ts';
import Block from '../render_dom/Block.ts';
import TemplateScope from './shared/TemplateScope.ts';
import { INode } from './interfaces.ts';

export default class Fragment extends Node {
	type: 'Fragment';
	block: Block;
	children: INode[];
	scope: TemplateScope;

	constructor(component: Component, info: any) {
		const scope = new TemplateScope();
		super(component, null, scope, info);

		this.scope = scope;
		this.children = map_children(component, this, scope, info.children);
	}
}

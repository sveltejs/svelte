import Node from './shared/Node';
import Component from '../Component';
import map_children from './shared/map_children';
import Block from '../render_dom/Block';
import TemplateScope from './shared/TemplateScope';
import { INode } from './interfaces';
import { TemplateNode } from '../../interfaces';

export default class Fragment extends Node {
	type: 'Fragment';
	block: Block;
	children: INode[];
	scope: TemplateScope;

	constructor(component: Component, info: TemplateNode) {
		const scope = new TemplateScope();
		super(component, null, scope, info);

		this.scope = scope;
		this.children = map_children(component, this, scope, info.children);
	}
}

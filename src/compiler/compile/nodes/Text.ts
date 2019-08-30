import Node from './shared/Node';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { INode } from './interfaces';

export default class Text extends Node {
	type: 'Text';
	data: string;
	synthetic: boolean;

	constructor(component: Component, parent: INode, scope: TemplateScope, info: any) {
		super(component, parent, scope, info);
		this.data = info.data;
		this.synthetic = info.synthetic || false;
	}
}

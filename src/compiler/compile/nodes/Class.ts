import Node from './shared/Node';
import Expression from './shared/Expression';
import { TemplateNode } from '../../interfaces';
import TemplateScope from './shared/TemplateScope';
import Component from '../Component';

export default class Class extends Node {
	type: 'Class';
	name: string;
	expression: Expression;

	constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		this.name = info.name;

		this.expression = info.expression
			? new Expression(component, this, scope, info.expression)
			: null;
	}
}

import Node from './shared/Node';
import Expression from './shared/Expression';
import { TemplateNode } from '../../interfaces';
import TemplateScope from './shared/TemplateScope';
import Component from '../Component';

// @paul
export default class Style extends Node {
	type: 'Style';
	name: string;
	expression: Expression;
	text: string;

	constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		this.name = info.name;

		this.text = info.text || null;

		this.expression = info.expression
			? new Expression(component, this, scope, info.expression)
			: null;
	}
}
